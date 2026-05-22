# CV player tracking & top-down radar — design spec

**Date:** 2026-05-22
**Status:** Approved
**Inspired by:** Piotr Skalski's Football AI demos (player tracking + tactical top-down projection)

## Goal

Add an on-device computer-vision pipeline to Playbook that, given a saved rugby clip, detects and tracks every player, classifies them by team, projects their positions onto a top-down rugby pitch, and shows the result as a small radar overlay (picture-in-picture) plus colored bounding boxes on the original video. Runs entirely on the user's Mac; no server, no network.

## Scope

### In scope (v1)
- Per-clip "Analyze" workflow — user picks a saved clip and runs tracking on it.
- Two output visualizations, both rendered in the existing clip player:
  - Top-down radar in a draggable picture-in-picture corner.
  - Colored bounding boxes overlaid on the original video.
- One-time per-match camera calibration (fixed wide-angle, single homography).
- Anonymous, team-colored dots (red = ours, blue = rivals). No jersey numbers.
- Background job model: result cached to disk; runs once per clip.
- Mac-only (Apple Silicon target via ONNX Runtime + CoreML execution provider).

### Out of scope (deferred)
- Pause-frame single-image analysis.
- Whole-match batch processing.
- Jersey-number OCR / linking to roster.
- Per-player analytics (distance, heatmaps, possession).
- Auto-tagging / auto-event detection.
- Ball tracking, pose estimation.
- Broadcast / multi-camera footage with pan-zoom-cut.
- Windows or Linux.

## Product decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Where it lives | Per-clip "Analyze" button | Smallest blast radius; fits existing workflow |
| Output | Radar PiP + box overlay (no analytics) | Matches the Skalski demo; visual-first v1 |
| Player identity | Anonymous, team-colored dots | No labeling step; ships fastest |
| Performance budget | Background, minutes per clip OK | Allows accurate model + cached result |
| Camera assumption | Fixed wide-angle, no pan/zoom/cut | Single homography per match — huge tech simplification |
| Scrum/ruck handling | Best-effort, may glitch (documented) | Pile-ups are an open problem; not v1's job |
| Clip length | No hard cap; warn over 60 s | Trust the user |

## Architecture

The pipeline runs in the **main process** (Node-native deps) and exposes a typed surface to the renderer through `window.api.cv.*`. The existing project pattern is preserved: Renderer → IPC → UseCase → Repository.

```
Renderer (analyze button, radar PiP, calibration UI)
   │ window.api.cv.<method>(...)
   ▼
preload/index.ts (typed contextBridge entries in api.d.ts)
   ▼
main/ipc/cv.ipc.ts            ← thin handler, returns IpcResult<T>
   │
   ▼
@playbook/business-logic › use cases
   │   - saveMatchCalibrationUseCase
   │   - getMatchCalibrationUseCase
   │   - runClipTrackingUseCase
   │   - getClipTrackingUseCase
   │   - deleteClipTrackingUseCase
   │
   ├──► @playbook/file-system › calibrationRepository, trackingRepository
   │
   └──► @playbook/cv  (NEW package)
            inference engine · ByteTrack · color clustering · homography
            │
            └── ONNX models bundled at apps/desktop/resources/models/
```

### Why a new `@playbook/cv` package
Inference + tracking + homography is ~800–1500 LOC with its own Node-native deps (`onnxruntime-node`, `sharp`). Isolating it keeps `business-logic` framework-free (use cases call into `@playbook/cv` the same way they call into `@playbook/file-system`) and lets us swap the inference backend later without touching the rest of the app.

## Storage layout

Extends the existing `<platformFolder>/<opponent>/<match>/...` structure:

```
<match>/
├── calibration.json            ← CalibrationEntity (per match)
├── clips/
│   ├── <uuid>.json             ← ClipEntity (existing)
│   └── <uuid>.tracking.json    ← TrackingEntity (NEW, per clip)
```

Atomic writes (write-then-rename) via the existing file-system package helpers. No tracking data is written inside the match folder until the job completes successfully.

## Entities

### CalibrationEntity (`@playbook/business-logic/calibration/calibration.entity.ts`)

```ts
export const calibrationSchema = z.object({
  version: z.literal(1),
  imageSize: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  pitchSize: z.tuple([
    z.number().min(50).max(150),  // length (m), default 100
    z.number().min(30).max(100),  // width  (m), default 70
  ]),
  anchors: z.array(z.object({
    image: z.tuple([z.number(), z.number()]),  // px
    pitch: z.tuple([z.number(), z.number()]),  // m
  })).min(4).max(8),
  homography: z.array(z.array(z.number()).length(3)).length(3),
  reprojectionError: z.number().nonnegative(),
  calibratedAt: z.string().datetime(),
});
```

### TrackingEntity (`@playbook/business-logic/tracking/tracking.entity.ts`)

```ts
const trackSchema = z.object({
  id: z.number().int().nonnegative(),      // ByteTrack persistent ID
  team: z.enum(['ours', 'rivals', 'unknown']),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),  // x,y,w,h in video px
  pitchXY: z.tuple([z.number(), z.number()]),                       // meters from corner
  confidence: z.number().min(0).max(1),
});

const frameSchema = z.object({
  t: z.number().nonnegative(),  // seconds from clip start
  tracks: z.array(trackSchema),
});

export const trackingSchema = z.object({
  version: z.literal(1),
  clipId: z.string().uuid(),
  modelVersion: z.string(),       // e.g. "yolo11n@1.0.0"
  fps: z.number().int().positive(),
  frameCount: z.number().int().nonnegative(),
  duration: z.number().nonnegative(),
  teamColors: z.object({
    ours: z.tuple([z.number(), z.number(), z.number()]),    // RGB
    rivals: z.tuple([z.number(), z.number(), z.number()]),
  }),
  frames: z.array(frameSchema),
});
```

## Calibration flow (one-time per match)

**Trigger:** non-blocking banner on the match page after import: *"Calibrate this match's camera angle to enable tracking — 2 min."* Skippable. Also accessible from match settings.

**UI:** new route `apps/desktop/src/renderer/app/matches/$matchId/calibrate/page.tsx`.

- Left: video frame canvas (paused on the first frame; scrubbable to any frame with clean markings).
- Right: SVG pitch reference (length × width form on top), with **6 numbered targets**: 4 try-line corners + 2 halfway-line/touchline intersections.
- User clicks each numbered point on the video; after ≥4 points, we compute homography (DLT + RANSAC, ~150 LOC TS in `@playbook/cv`, runs in renderer).
- Live preview: project the video frame's bounding rectangle onto the pitch diagram as a colored quad. If skewed/inverted, user re-clicks.
- Footer: anchor counter, reprojection-error readout, **Save** / **Skip**.

**Validation in `saveMatchCalibrationUseCase`:**
- anchors ≥ 4, image points unique, pitch points unique
- homography determinant non-singular
- per-anchor reprojection error < 30 px (warn but allow save; typical good ≈ <10 px)

**Re-calibration:** stored anchors are kept so re-opening the screen shows previous clicks for fine-tuning.

## Per-clip analysis pipeline

`runClipTrackingUseCase(clipId)` orchestrates:

1. Load clip + match calibration. Throw if calibration missing.
2. Extract frames from `[inMs, outMs]` via `fluent-ffmpeg`, downscale to 1280 wide, at the configured fps (default 10). Frames go to OS temp dir, **not** the match folder.
3. For each frame:
   a. YOLO11n person detection (CoreML EP via `onnxruntime-node`).
   b. ByteTrack update → persistent track IDs.
4. Team classification (runs once after a ~30-frame warmup):
   - Crop the torso region from every detection in the warmup window.
   - Compute mean HSV per crop; KMeans (k=2) on hues → 2 cluster centroids.
   - User picks which centroid = "ours" once per match. The chosen pair of RGB centroids is persisted on the existing `MatchEntity` as a new optional field `teamColors: { ours: [r,g,b], rivals: [r,g,b] } | null` and reused on every subsequent clip in that match.
   - Every track gets a team label by nearest centroid.
5. For each tracked box in every frame:
   - foot point = `(bbox.center_x, bbox.bottom)`
   - `pitchXY = homography @ foot_point`
6. Atomic write of `<uuid>.tracking.json`.
7. Clean up temp frames.
8. Emit `cv:job-update {clipId, status: "done"}`.

**Frame rate:** default 10 fps gives smooth interpolation on the radar while keeping a 15 s clip at ~10–15 s end-to-end. Configurable in settings.

**Job lifecycle:**
- `tracking.run(clipId)` returns `{jobId}` immediately.
- Main keeps `Map<jobId, JobState>` with `{stage, framesDone, framesTotal, error?}`.
- Progress pushed via single IPC event `cv:job-update` every 250 ms.
- One job at a time (queue the rest) — ONNX session memory and laptop thermals.

**Re-run:** if `<uuid>.tracking.json` exists, button becomes "Re-analyze"; clicking wipes the old file and re-runs.

## UI components

| Component | Location | Responsibility |
|---|---|---|
| `<FrameClicker>` | `matches/$matchId/calibrate/_components/` | Canvas over video frame, captures clicks, draws numbered markers |
| `<PitchReference>` | `matches/$matchId/calibrate/_components/` | SVG rugby pitch + numbered targets + live homography preview quad |
| `useHomography` | `matches/$matchId/calibrate/_hooks/` | DLT/RANSAC solver in renderer |
| `<AnalyzeClipButton>` | clip detail panel | States: idle / running (progress chip) / done (Re-analyze + badge); disabled if no calibration |
| `<TrackingOverlay>` | video player area | Canvas over `<video>` drawing per-frame boxes; toggle via eye icon |
| `<RadarPiP>` | video player area | Draggable corner-snapped card; SVG pitch + canvas dots; toggle/dismiss |
| `cv.store.ts` (Zustand) | `_stores/` | `jobsByClip`, `trackingByClip`, PiP corner preference |

**Playback sync:** both overlays read from the loaded `TrackingEntity` JSON — no IPC during playback. Frame lookup is `frames[Math.round(t * fps)]` (O(1)). Driven by `requestAnimationFrame` reading `video.currentTime`.

**Visibility matrix**

| State | Box overlay | Radar PiP | Analyze button |
|---|---|---|---|
| No calibration | hidden | hidden | disabled (tooltip) |
| Calibrated, no tracking | hidden | hidden | "Analyze" |
| Job running | hidden | hidden | progress chip |
| Tracking ready | toggleable | toggleable | "Re-analyze" |

## IPC surface (added to `apps/desktop/src/preload/api.d.ts`)

```ts
window.api.cv = {
  // calibration
  getCalibration(matchId: string): Promise<IpcResult<CalibrationEntity | null>>;
  saveCalibration(matchId: string, input: SaveCalibrationInput): Promise<IpcResult<CalibrationEntity>>;

  // tracking
  getTracking(clipId: string): Promise<IpcResult<TrackingEntity | null>>;
  runTracking(clipId: string): Promise<IpcResult<{ jobId: string }>>;
  cancelTracking(jobId: string): Promise<IpcResult<void>>;
  deleteTracking(clipId: string): Promise<IpcResult<void>>;

  // progress events (subscribe via preload-managed callback registry)
  onJobUpdate(handler: (event: JobUpdateEvent) => void): () => void; // returns unsubscribe
};
```

## Models and dependencies

**Model:** YOLO11n (nano), exported to ONNX, person-class only.
- 2.6 M params, ~10 MB on disk
- Input: 640 × 384 letterboxed, FP16
- Bundled at `apps/desktop/resources/models/yolo11n.onnx`; pinned commit + sha256 in repo
- M1/M2 CoreML EP: ~25–40 ms/frame → ~5 s pure inference for a 15 s clip at 10 fps

**New dependencies**

| Package | Where | Why |
|---|---|---|
| `onnxruntime-node` | `@playbook/cv` | ONNX inference with CoreML EP |
| `sharp` | `@playbook/cv` | Fast image decode + crop/resize for color clustering |
| (vendored) ByteTrack | `@playbook/cv` | ~250 LOC TS, vendored — npm ports are unmaintained |
| (vendored) DLT + RANSAC | `@playbook/cv` | ~150 LOC TS, used by renderer and main |

Existing `fluent-ffmpeg` + `ffmpeg-static` reused for frame extraction.

## Edge cases

| Case | Handling |
|---|---|
| Scrum / ruck pile-up | IDs may glitch; surface a "low tracking confidence at X–Y" note when avg detections drop sharply. No special model logic in v1. |
| Camera shifts mid-match | Reprojection error grows. Not auto-detected. Documented limit: re-import as a separate match. |
| Clip > 60 s | Pre-run dialog: "This clip is N s. Analysis will take ~X min. Continue?" |
| Referee mis-labeled by KMeans | Accepted in v1; user can re-run if visibly wrong. (v2: HSV referee preset.) |
| Different video resolution but same aspect ratio | Anchors scale proportionally; calibration stays valid. |
| Different aspect ratio | Error: "This video has a different aspect ratio than calibration — re-calibrate." |
| ffmpeg fails | Toast error; no file written. |
| Missing ONNX model file | Toast + "Re-install models" action in settings. |
| CoreML EP fails to init | Fall back to CPU EP (~3× slower) with a logged warning. |
| Crash mid-job | Temp frames live in OS temp, not match folder — no orphans in user data. |

## Validation checklist (acceptance)

- [ ] User can import a match, see the calibration banner, complete calibration in <2 minutes, and save.
- [ ] Anchors and homography persist; reopening the screen shows previous clicks.
- [ ] Pitch dimensions can be edited; homography recomputes and a toast confirms.
- [ ] Without calibration, the Analyze button on every clip is disabled with the right tooltip.
- [ ] Clicking Analyze starts a job; progress chip updates from "Extracting" → "Detecting N%" → "Done".
- [ ] Tracking output is written atomically; re-opening the clip loads it instantly.
- [ ] Box overlay draws per-frame and stays in sync when scrubbing.
- [ ] Radar PiP draws per-frame dots colored by team, draggable to any corner, persisted preference.
- [ ] Both overlays toggle independently.
- [ ] "Re-analyze" wipes the old file and re-runs.
- [ ] Clip > 60 s triggers the confirmation dialog with a time estimate.
- [ ] ONNX model loads with CoreML EP on Apple Silicon; falls back to CPU EP if needed.
- [ ] No `fs` / `path` / `electron` imports anywhere in renderer; CV code lives only in main + `@playbook/cv`.
- [ ] Every new IPC channel has a typed entry in `apps/desktop/src/preload/api.d.ts`.

## References

- Source brief: `.claude/docs/product-context.md`
- Mockup: `.claude/docs/design-mockup.png`
- Architecture conventions: `CLAUDE.md`
- Skills to consult during implementation: `codebase-patterns`, `styling-patterns`, `electron-patterns`, `file-system-storage`, `video-editing`
