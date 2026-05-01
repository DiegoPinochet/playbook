---
description: Audit the working tree against Playbook's architectural patterns.
allowed-tools: Bash, Read, Grep
---

Read `CLAUDE.md` and the relevant skills under `.claude/skills/` before auditing.

## Things to check

Walk the diff (`git diff` + new files) and report violations of any of these:

### Process boundaries
- Renderer code (`apps/desktop/src/renderer/**`) MUST NOT import from `node:*`, `electron`, `fs`, `path`, or `@playbook/file-system`. Renderer talks to the main process exclusively via `window.api`.
- Main code (`apps/desktop/src/main/**`) MUST NOT import React, JSX, or anything from `apps/desktop/src/renderer/**`.
- `@playbook/business-logic` MUST NOT import from `electron`, `react`, or `@playbook/ui`.
- `@playbook/file-system` MUST NOT import from `electron` or `react`.

### IPC pattern
- Every IPC handler is wrapped with `handle()` from `apps/desktop/src/main/ipc/_helpers.ts`.
- Every new channel has a corresponding typed entry in `apps/desktop/src/preload/api.d.ts`.
- Renderer call sites use `window.api.<domain>.<method>` only — never `ipcRenderer` directly.

### File naming & co-location
- `kebab-case.ts`. Suffixes: `.entity.ts`, `.use-case.ts`, `.repository.ts`, `.ipc.ts`, `.store.ts`.
- Stores live under `apps/desktop/src/renderer/_stores/`.
- Route-private components under `_components/` next to the route.

### Storage / persistence
- All filesystem reads/writes go through a repository in `@playbook/file-system`. No raw `readFile`/`writeFile` in business-logic, IPC handlers, or main process.
- Paths are constructed via `paths.*` helpers. No string concatenation of platform/opponent/match paths.
- Writes use `atomicWriteJson` (temp file + rename), never `writeFile` for JSON.

### Validation
- Every entity has a Zod schema. Use cases parse inputs (`schema.parse(input)`) at the entry point.
- Repositories accept already-shaped records and don't re-validate.

### UI
- All UI imports come from `@playbook/ui`. No copies of `Button`, `Card`, `Dialog`, etc. inside the renderer.
- Color via semantic tokens (`bg-background`, `text-muted-foreground`, etc.) or the explicit tag tokens (`tag-attack`, ...). No raw hex except for user-chosen colors stored in entities.

## How to run

For each rule, use `grep`/`rg` over the changed files. Report violations as a checklist:

```
- [ ] <file:line> — <rule violated> — suggested fix
```

If everything is clean, say so explicitly.
