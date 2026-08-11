# Guided onboarding tour & tag groups — design spec

**Date:** 2026-08-10
**Status:** Approved
**Author:** brainstorming session

## Goal

After a user imports their first match, walk them through cutting and tagging one clip — inside the real app, on their real footage — so they leave understanding what tags are for, how tags are grouped, and where scouting notes live. Shown once, replayable from a toggle on the Opponents screen.

Prerequisite: tags gain real groups, because the tour teaches grouping and today the taxonomy is flat.

## Non-goals

- No changes to the existing first-run onboarding (`/onboarding`: platform folder → sport). That flow is untouched.
- No annotations coverage. `AnnotationEntity` and its IPC exist but have no renderer UI; the tour teaches only shipped surfaces.
- No tour on the player-report page, the CV/metrics pages, or the opponents list itself.
- No per-match or per-opponent tour state. One app-level boolean, nothing more.
- No renaming, recoloring, or removal of existing preset tags. Groups are additive.
- No test framework. This repo has none (`pnpm lint` is `tsc --noEmit`); the tour does not introduce one.

---

## Part A — Tag groups

### Why this is cheap

`listTagsUseCase` synthesizes preset tags from `SPORT_PRESETS` on every read; `tags.json` persists **only** custom tags. Adding a group to presets therefore requires no migration. Legacy custom records lack the field and fall through a Zod default.

### Taxonomy

Six groups, fixed order, shared across all sports. A group with no tags renders nothing.

| Group id | Label | Purpose line (single source of copy, reused by the tour) |
|---|---|---|
| `set-piece` | Set piece | Restarts and dead-ball situations |
| `phase` | Phase play | What happens in open play |
| `outcome` | Outcome | How the passage ended |
| `discipline` | Discipline | Fouls, offside, cards |
| `team` | Team | Whose passage this was |
| `custom` | Your tags | Tags you created for this platform |

### Mapping

**Rugby** — `lineout`, `scrum`, `set-piece` → set-piece · `breakdown`, `attack`, `defence`, `kicking` → phase · `try`, `turnover`, `linebreak`, `missed-tackle` → outcome · `ours`, `rivals` → team

**Football** — `corner`, `free-kick` → set-piece · `tackle`, `pass`, `save` → phase · `goal`, `shot-on-target`, `shot-off-target` → outcome · `foul`, `offside`, `yellow-card`, `red-card` → discipline · `ours`, `rivals` → team

**Field hockey** — `short-corner`, `penalty-corner`, `penalty-stroke` → set-piece · `circle-entry`, `tackle`, `interception`, `pass` → phase · `goal` → outcome · `foul`, `green-card`, `yellow-card`, `red-card` → discipline · `ours`, `rivals` → team

Rugby has no `discipline` tags today; the group simply renders empty and is skipped. That is expected, not an omission.

### Data model changes

- **New** `packages/business-logic/src/clips/tag-group.ts`:
  ```ts
  export const TAG_GROUPS = ["set-piece", "phase", "outcome", "discipline", "team", "custom"] as const;
  export const tagGroupSchema = z.enum(TAG_GROUPS);
  export type TagGroup = z.infer<typeof tagGroupSchema>;
  export const TAG_GROUP_LABELS: Record<TagGroup, string>;
  export const TAG_GROUP_PURPOSE: Record<TagGroup, string>;
  export const TAG_GROUP_ORDER: ReadonlyArray<TagGroup>;   // the table order above
  export function groupTags<T extends { group: TagGroup }>(tags: T[]): Array<{ group: TagGroup; tags: T[] }>;
  ```
  `groupTags` returns groups in `TAG_GROUP_ORDER`, omitting empty ones. Both the clip dialog and the left rail consume it, so grouping order can never drift between the two.
- `tag.entity.ts` — `tagSchema` gains `group: tagGroupSchema.default("custom")`.
- `presets/index.ts` — `PresetTag` gains `group: TagGroup`.
- The three preset files — each tag gains its `group` per the mapping above.
- `list-tags.use-case.ts` — preset tags carry `t.group`; custom tags carry `c.group ?? "custom"`.
- `create-custom-tag.use-case.ts` — `CreateCustomTagInput` gains optional `group`, defaulting to `"custom"`, validated through `tagGroupSchema`.
- `file-system/repositories/tag.repository.ts` — `TagRecord` gains `group?: string` (optional, for tolerance of records written by older builds).
- Exports added to `business-logic/src/index.ts` and `src/pure.ts` (the renderer imports from `pure`).

### UI changes

- **`clip-editor-dialog.tsx`** — tag chips render under uppercase group headers via `groupTags`. The custom-tag creation row gains a group picker (`DropdownMenu` from `@playbook/ui`, defaulting to *Your tags*) so new tags can be filed into a real group instead of accumulating in one bucket.
- **`match-editor.page.tsx`** left rail — the flat tag filter list becomes the same grouped sections, each tag keeping its per-tag clip count.

Both stay driven by `TAG_GROUP_LABELS` / `TAG_GROUP_ORDER`; neither hardcodes group names.

---

## Part B — Guided tour

### Engine

`react-joyride@^3.2.0` (peer range `react: 16.8 - 19`, so React 19 is supported) added to `apps/desktop`, used in **controlled mode**: `run` and `stepIndex` are owned by a Zustand store, and `tooltipComponent` renders our own card, so none of joyride's default styling ships.

```
_stores/tour.store.ts        running · stepIndex · start / stop / next / signal(event)
_components/tour/
  tour-guide.tsx             <Joyride> wiring; mounted once inside <App>
  tour-card.tsx              coach-mark: Card + step counter + Skip + conditional Next
  tour-steps.ts              the script — target selector, copy, gating event, placement
```

### Action gating

Each step optionally declares `awaits: TourSignal`. Existing components call `useTourStore.getState().signal("out-marked")` at the real interaction point; the store advances only when the *current* step is waiting on that signal, so stray signals are inert.

```ts
type TourSignal =
  | "in-marked" | "out-marked" | "dialog-opened"
  | "tag-selected" | "clip-saved" | "notes-opened";
```

Steps without `awaits` show a **Next** button. Gated steps hide Next and show a nudge instead (*"Press **O** or click Mark out"*). **Skip tour** is present on every step.

Targets are `data-tour="…"` attributes added to existing elements — no component restructuring, and the selectors live only in `tour-steps.ts`.

### Radix dialog interop

Steps 6–9 target elements inside `ClipEditorDialog`. Radix's modal mode traps focus, applies `pointer-events: none` outside the content, and marks outside content `aria-hidden` — which would render a joyride tooltip (portalled to `document.body`) invisible to clicks and stuck under the overlay.

Resolution, all in `clip-editor-dialog.tsx`:
- `<Dialog modal={!tourRunning}>` — while the tour runs there is no focus trap and no pointer-events lock.
- `<DialogContent onInteractOutside={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>` so the non-modal dialog still can't be dismissed by clicking the spotlight.
- Joyride configured with `styles.options.zIndex: 10000` (Radix overlay is `z-50`), `spotlightClicks: true` so the highlighted chip/field remains usable, `disableOverlayClose: true`, `disableCloseOnEsc: false`.

`ClipEditorDialog` reads `running` from the tour store directly rather than taking a new prop, keeping both call sites in `match-editor.page.tsx` unchanged.

### The script

12 steps. Copy for the tags step pulls group labels and purpose lines from `tag-group.ts`.

| # | Target | Advance |
|---|---|---|
| 1 | centered (`body`) — "Your match is in. Let's cut one clip together — about a minute." | Next |
| 2 | transport bar — scrub/play to something worth keeping | Next |
| 3 | Mark in button — a clip is just in/out points; the source video is never modified | `in-marked` |
| 4 | Mark out button — the REC indicator shows a cut in progress | `out-marked` |
| 5 | + Clip button | `dialog-opened` |
| 6 | title/description fields | Next |
| 7 | tag chips — groups, why tags combine (*Lineout + Rivals + Turnover* is one query later), colors are what you read on the timeline | `tag-selected` |
| 8 | player-numbers field — these feed the player report | Next |
| 9 | Save clip button | `clip-saved` |
| 10 | notes toggle in the header (⌘J) | `notes-opened` |
| 11 | notes panel — markdown scouting notes, scoped per **opponent**, not per match | Next |
| 12 | centered recap — player report · export playlist · star for review · search + tag filters · keyboard shortcuts. Button: **Finish** | Finish |

Steps 10–11 are a single "notes" beat split across two anchors: the header toggle, then the panel it opens.

After step 9 the saved clip is visible on the timeline and in the right rail; step 9's copy points at both rather than spending separate steps on them.

### Start / stop semantics

One boolean in `settings.json` (userData, app-level): **`tourEnabled`**, default `true`.

- The tour starts when `MatchEditorPage` mounts with `tourEnabled === true`, after tags and clips have loaded (targets must exist). The store guards one start per mount.
- A match editor is only reachable after an import, so "first import" needs no separate flag — it falls out of the default.
- **Finish** or **Skip** sets `tourEnabled = false` and persists. That is the "shown once".
- Interrupting by navigating away leaves it `true`, so an abandoned tour resumes from step 1 next time. Intentional.

### On/off control

Opponents screen (`app/opponents/page.tsx`) header, left of *New opponent*: a `size="icon-sm"` ghost `Button` with the `GraduationCap` icon, `aria-pressed={tourEnabled}`, wrapped in a Tooltip reading **"Guided tour"**. It toggles the same boolean; enabling toasts *"Guided tour on — open a match to start."*

### Persistence plumbing

Following the existing settings pattern (`set-platform-folder.use-case.ts`):

- `settingsSchema` gains `tourEnabled: z.boolean().default(true)`; `DEFAULT_SETTINGS` updated.
- New `settings/use-cases/set-tour-enabled.use-case.ts`.
- `settings.ipc.ts` gains `settings.setTourEnabled`.
- `preload/index.ts` + `preload/api.d.ts` gain the matching typed entry.
- `settings.store.ts` gains `setTourEnabled(enabled: boolean)`.

---

## Files

**New (7)**
`packages/business-logic/src/clips/tag-group.ts`
`packages/business-logic/src/settings/use-cases/set-tour-enabled.use-case.ts`
`apps/desktop/src/renderer/_stores/tour.store.ts`
`apps/desktop/src/renderer/_components/tour/tour-guide.tsx`
`apps/desktop/src/renderer/_components/tour/tour-card.tsx`
`apps/desktop/src/renderer/_components/tour/tour-steps.ts`
`docs/superpowers/specs/2026-08-10-guided-onboarding-tour-design.md` (this file)

**Modified (14)**
`packages/business-logic/src/clips/tag.entity.ts`
`packages/business-logic/src/clips/use-cases/list-tags.use-case.ts`
`packages/business-logic/src/clips/use-cases/create-custom-tag.use-case.ts`
`packages/business-logic/src/sports/presets/{index,rugby.preset,football.preset,field-hockey.preset}.ts`
`packages/business-logic/src/settings/settings.entity.ts`
`packages/business-logic/src/{index,pure}.ts`
`packages/file-system/src/repositories/tag.repository.ts`
`apps/desktop/src/main/ipc/settings.ipc.ts`
`apps/desktop/src/preload/{index.ts,api.d.ts}`
`apps/desktop/src/renderer/app.tsx`
`apps/desktop/src/renderer/app/opponents/page.tsx`
`apps/desktop/src/renderer/app/matches/match-editor.page.tsx`
`apps/desktop/src/renderer/_components/clip-editor-dialog.tsx`
`apps/desktop/src/renderer/_components/app-shell.tsx`
`apps/desktop/src/renderer/_stores/settings.store.ts`

**Dependency:** `react-joyride@^3.2.0` in `apps/desktop`.

## Verification

`pnpm lint` (tsc across every package) must pass, plus a manual pass in `pnpm dev`:

1. Fresh platform folder → import a match → tour auto-starts at step 1.
2. Gated steps refuse to advance until the real action happens (I, O, tag click, save).
3. Steps 6–9 are clickable and typable inside the dialog; the dialog does not close on spotlight clicks.
4. Finish → reopen a match → no tour.
5. Opponents screen toggle → on → open a match → tour replays; off → never runs.
6. Existing `tags.json` with custom tags written before this change still loads, tags landing under *Your tags*.

## Risks

- **react-joyride + React 19 in Electron.** Peer range covers 19, but the first build is the real test. If it misbehaves, the fallback is `driver.js` (zero deps) behind the same store interface — `tour-steps.ts` and the gating contract stay unchanged, only `tour-guide.tsx` is rewritten.
- **Non-modal dialog during the tour.** Disabling `modal` also disables Radix's focus management; the tour must not be the only thing keeping the dialog usable. Escape-to-close stays enabled as the escape hatch.
- **Target timing.** Steps target elements that mount asynchronously (video metadata, tag list). Starting only after tags and clips resolve avoids joyride's "target not found" warning; a step whose target is missing is skipped rather than blocking the tour.
