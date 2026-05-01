---
name: codebase-patterns
description: Use when adding a use case, IPC handler, repository, store, or new route. Triggers on "add a use case", "create an IPC handler", "wire a new feature", "add a store", "add a renderer route".
---

Read these references in order when planning the work:

- `references/architecture.md` — the four layers and what's allowed where
- `references/use-cases.md` — entity + use-case shape (Zod schemas, throwing rules, naming)
- `references/repositories.md` — file-system repository shape, atomic write rules, slug helpers
- `references/ipc.md` — `handle()` helper, channel naming, IpcResult contract, preload typing
- `references/stores.md` — Zustand store shape, when to load, what NOT to put in stores
- `references/routes.md` — adding a new renderer route + page + co-located components

## Quick rules (always)

1. Renderer never touches `fs` / `electron`. Always go through `window.api`.
2. Use cases are framework-free. No imports of `electron`, `react`, `@playbook/ui`, IPC stuff.
3. Repositories own all filesystem I/O. Use `paths.*`, `atomicWriteJson`, `readJson`. No raw `writeFile` for JSON elsewhere.
4. Every IPC channel has a typed entry in `apps/desktop/src/preload/api.d.ts`.
5. After every code change, run `/simplify` and `/verify-patterns`.
