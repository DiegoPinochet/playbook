# Playbook — Rugby Match Video Analysis

Local-first Electron desktop app for tagging, cutting, and reviewing rugby match footage of rival teams. No backend, no database — all data lives in the user's filesystem at a chosen "platform folder".

## Tech stack

- **Shell**: Electron 33 via `electron-vite`, packaged with `electron-builder` (mac dmg/zip)
- **UI**: React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (base-nova) · Lucide
- **State**: Zustand (renderer)
- **Forms**: React Hook Form (when needed) + Zod schemas for entity validation
- **Routing**: react-router-dom (HashRouter — no server)
- **Video**: HTML5 `<video>` in renderer; `ffmpeg-static` + `fluent-ffmpeg` in main for cuts/exports/thumbnails
- **Monorepo**: Turborepo + pnpm workspaces

## Architecture

```
Renderer (React + Zustand)
   │ window.api.<domain>.<method>(...)
   ▼
preload/index.ts (contextBridge)
   │ ipcRenderer.invoke(channel, args)
   ▼
main/ipc/<domain>.ipc.ts          ← thin handler, returns IpcResult<T>
   │ calls
   ▼
@playbook/business-logic › <verb><Domain>UseCase()  ← framework-free
   │ calls
   ▼
@playbook/file-system  › <domain>Repository.<op>()  ← fs/promises + JSON
   │
   ▼
disk: <platformFolder>/<opponentSlug>/<matchSlug>/...
```

**This is the praxxi/tup pattern adapted to Electron**: Renderer→IPC→UseCase→Repository.

## Internal packages

| Package | Purpose |
|---|---|
| `@playbook/ui` | shadcn/ui re-exports + theme (oklch tokens, dark default). **Always import UI components from here.** |
| `@playbook/business-logic` | Entities (Zod schemas) + use cases. **Framework-free** — no Electron, no React. |
| `@playbook/file-system` | Local FS persistence — replaces a database. Repositories operate on JSON files at well-known paths. **Never instantiate `fs` outside this package.** |

## Storage layout (filesystem-as-DB)

```
<platformFolder>/
├── <opponentSlug>/
│   ├── opponent.json           ← OpponentEntity
│   ├── <matchSlug>/
│   │   ├── match.json          ← MatchEntity
│   │   ├── video.<ext>         ← imported source
│   │   ├── tags.json           ← user-defined custom tags (defaults are in code)
│   │   ├── players.json        ← roster
│   │   ├── clips/
│   │   │   └── <uuid>.json     ← ClipEntity
│   │   └── annotations/
│   │       ├── <uuid>.json     ← AnnotationEntity
│   │       └── <uuid>.png      ← frame thumbnail
```

Use `paths.*` from `@playbook/file-system` — never construct paths by hand.

## Conventions

- **File naming**: `kebab-case.ts`. Suffixes: `.entity.ts`, `.use-case.ts`, `.repository.ts`, `.ipc.ts`, `.store.ts`.
- **Co-location**: pages in `apps/desktop/src/renderer/app/<route>/page.tsx`; route-private components in `_components/`; stores in `_stores/`; hooks in `_hooks/`.
- **Process boundaries (hard rules)**:
  - No `fs`, `path`, `electron`, or any Node import in the renderer.
  - No React in main or in `@playbook/business-logic` / `@playbook/file-system`.
  - All renderer↔main calls go through `window.api`. Add a typed entry to `apps/desktop/src/preload/api.d.ts` whenever you add a new IPC channel.
- **Error handling**:
  - Use cases throw on invalid input or unexpected state.
  - IPC handlers wrap with `handle()` from `_helpers.ts` and return `{ ok: true, data } | { ok: false, error }`.
  - Renderer surfaces errors with `toast.error(...)`.
- **Validation**: every entity has a Zod schema in `<domain>/<entity>.entity.ts`. Use cases parse inputs at the edge.
- **No translations layer** (single-locale for now; copy is in English).
- **Soft deletes**: not used — deletes are real (the user owns the filesystem).
- **UI imports**: always from `@playbook/ui`, never from local files.

## Available skills (read before working in that area)

| Skill | When |
|---|---|
| `codebase-patterns` | Adding a use case, IPC handler, repository, or store |
| `styling-patterns` | Building or modifying UI, layouts, dialogs, the timeline, etc. |
| `electron-patterns` | Anything touching main/preload/renderer boundaries, IPC channels, Electron APIs |
| `file-system-storage` | New JSON shapes, new on-disk layout, atomic writes, slug rules |
| `video-editing` | ffmpeg cut/concat, thumbnail extraction, timeline math, playback |

## Commands

- `pnpm dev` — runs `electron-vite dev`, hot-reloads renderer + main
- `pnpm build` — type-check + build all packages and the desktop app
- `pnpm lint` — `tsc --noEmit` across all packages (used by husky pre-commit)
- `pnpm format` — Prettier write across the workspace
- `pnpm dist` — package the mac dmg via electron-builder

## Commit & PR style

- **Commits**: gitmoji prefix + imperative + concise body. Examples:
  - `🎉 initial scaffold`
  - `✨ add player action report`
  - `🐛 fix clip create dialog losing tag selection`
- **Hooks**: husky pre-commit runs `pnpm lint`.

## After every code change

Run `/simplify` to review the code you just wrote for reuse, quality, and efficiency — fix what it finds.

## Reference

- Audio brief + design mockup: `.claude/docs/product-context.md`
- Mockup image: `.claude/docs/design-mockup.png`
