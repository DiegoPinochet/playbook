---
name: video-editing
description: Use when working with the video player, the timeline, ffmpeg cut/concat, thumbnail extraction, or anything that touches playback math. Triggers on "play this clip", "cut this segment", "concat clips", "extract a frame", "scrub the video", "add a marker".
---

## Playback (renderer)

- HTML5 `<video>` element. Source is a `file://` URL pointing into the match folder.
- The renderer never copies or mutates the video file — it reads the path and lets the OS stream it.
- For frame-accurate scrub, set `currentTime`. For ±1s nudge use the `←`/`→` keys.
- For pause-frame work, call `videoEl.pause()` then either snapshot to a `<canvas>` (cheap) or extract via ffmpeg in main (slower but exact).

## Cutting clips (main)

`apps/desktop/src/main/ffmpeg/cut.ts`:

- `cutClip({ inputVideoPath, outputPath, startSec, endSec })` — uses `-c copy` (stream copy, no re-encode). Fast and lossless. Cuts may snap to the nearest keyframe before `startSec` — acceptable for analysis. If frame-accurate cuts are required later, switch to a re-encode (`-c:v libx264 -preset veryfast`).
- `concatClips({ inputVideoPath, segments, outputPath, workDir })` — cuts each segment then concats with ffmpeg's concat demuxer. The work dir is wiped automatically by the OS but you can clean it up manually.

## Thumbnails (main)

`apps/desktop/src/main/ffmpeg/thumbnail.ts`:

- `extractThumbnail({ inputVideoPath, timestampSec, outputPath })` — single-frame extraction at a timestamp. Use this when saving an annotation: extract a PNG at `timestampSec`, save as `<annotation-id>.png` in `annotations/`.
- `probeDurationSec(inputVideoPath)` — uses `ffprobe` (bundled with ffmpeg-static) to read the duration. Useful when importing a video to populate `videoDurationSec` on the match entity.

## Timeline math

Convert seconds ↔ percent for the timeline:

```
pct = (sec / durationSec) * 100
```

For tick spacing, choose:
- ≥10min duration → 5min ticks
- 2–10min → 1min ticks
- <2min → 10s ticks

The `Timeline` component already handles this — only revisit if you change the look.

## Adding a new export flow

1. Add a function in `apps/desktop/src/main/ffmpeg/<file>.ts` that returns `Promise<void>` and writes to a destination path.
2. Add an IPC channel in `apps/desktop/src/main/ipc/video.ipc.ts`.
3. Expose via preload + add to `api.d.ts`.

## Don'ts

- Don't transcode by default — `-c copy` is the right choice for analysis cuts.
- Don't run ffmpeg from the renderer (no node integration there anyway). All ffmpeg lives in main.
- Don't decode video frames in the renderer for analysis. Use ffmpeg in main for any pixel work.
