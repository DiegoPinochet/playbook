---
name: electron-patterns
description: Use when touching main, preload, IPC channels, contextBridge, BrowserWindow, dialogs, or anything that crosses the renderer↔main boundary. Triggers on "expose to renderer", "add an IPC channel", "open a native dialog", "main process".
---

## Process boundaries (NEVER violate)

| Process | Can use | Cannot use |
|---|---|---|
| Main (`src/main/**`) | `electron`, `node:fs`, `@playbook/business-logic`, `@playbook/file-system`, ffmpeg helpers | React, JSX, anything from `src/renderer/**` |
| Preload (`src/preload/**`) | `electron` (`contextBridge`, `ipcRenderer`) | Heavy logic — keep it a thin bridge |
| Renderer (`src/renderer/**`) | React, `@playbook/ui`, `@playbook/business-logic` types, `window.api` | `node:*`, `electron`, `@playbook/file-system`, raw `ipcRenderer` |

`contextIsolation: true` and `nodeIntegration: false` are non-negotiable. Sandboxed renderer.

## Adding an IPC channel — the 3 places

See `codebase-patterns/references/ipc.md` for the canonical recipe. tldr:

1. **Handler** in `src/main/ipc/<domain>.ipc.ts` using `handle("channel.name", async (_e, ...args) => { ... })`.
2. **Bridge** in `src/preload/index.ts` — add the method to the `api` object.
3. **Type** in `src/preload/api.d.ts` — add to the `PlaybookApi` interface.

All three must agree on the channel name and arg shape.

## IpcResult contract

`handle()` returns `{ ok: true, data } | { ok: false, error }`. The preload's `invoke<T>()` unwraps this — non-`ok` becomes a thrown `Error` in the renderer. So renderer code just does `try / catch` and shows `toast.error(err.message)`.

Never log secrets in `console.error` — use cases run on the main process and have access to the user's filesystem.

## Native dialogs

Always pass the parent window:

```ts
const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
const result = await dialog.showOpenDialog(window!, { ... });
```

Return plain strings/null over IPC — never pass `Electron.OpenDialogReturnValue` to the renderer.

## File serving in renderer

Local video files are loaded with `file://` URLs. The CSP in `index.html` allows `media-src 'self' blob: file:`. If you need to serve images from disk (e.g., annotation thumbnails), use `file://` in the `<img src>`. For larger streams or future-safe behavior, register a custom `protocol` handler in main.

## ffmpeg

Always run via `createFfmpegCommand()` in `src/main/ffmpeg/runner.ts`. In packaged builds the binary path goes through `app.asar.unpacked` — `runner.ts` already handles this. When adding new ffmpeg flows, put them in `src/main/ffmpeg/` and expose via an IPC channel.
