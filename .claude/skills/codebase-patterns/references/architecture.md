# Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer  (apps/desktop/src/renderer)                       │
│   React + Zustand. Calls window.api.<domain>.<method>(...).  │
│   May import: @playbook/ui, @playbook/business-logic types,  │
│               react-router-dom, lucide-react, sonner.        │
│   May NOT import: fs, path, electron, @playbook/file-system. │
└─────────────────────────────────────────────────────────────┘
                            │  contextBridge (preload/index.ts)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Main / IPC  (apps/desktop/src/main/ipc/<domain>.ipc.ts)      │
│   Thin Electron handlers. Wrap every handler with handle().  │
│   Use cases live in @playbook/business-logic.                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Use cases  (@playbook/business-logic/src/<domain>/...)       │
│   Pure orchestration: parse input (Zod), call repository,    │
│   maybe assemble entities. Framework-free.                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Repositories  (@playbook/file-system/src/repositories)        │
│   fs/promises. Atomic writes. Single source of path truth.   │
└─────────────────────────────────────────────────────────────┘
```

## Hard rules

1. **No `fs`, `path`, `electron`, or `@playbook/file-system` in the renderer.** Add or extend an IPC channel instead.
2. **No React or `@playbook/ui` in main, business-logic, or file-system packages.**
3. **No `@playbook/file-system` import inside `@playbook/business-logic`'s entities** (the entities are pure types/schemas; only use-cases call repositories).
4. **All paths go through `paths.*` helpers.** Never concatenate `<platform>/<opponent>/...` by hand.
5. **All JSON writes go through `atomicWriteJson`.** Never `fs.writeFile(path, JSON.stringify(...))` directly.
