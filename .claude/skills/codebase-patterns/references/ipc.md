# IPC

The bridge between renderer and main. Three places to touch when adding a channel.

## 1. Main IPC handler

File: `apps/desktop/src/main/ipc/<domain>.ipc.ts`

```ts
import { handle } from "./_helpers";
import { someUseCase, type SomeEntity } from "@playbook/business-logic";

export function registerXxxHandlers(): void {
  handle<[string, SomeInput], SomeEntity>("xxx.create", (_e, platform, input) =>
    someUseCase(platform, input)
  );
}
```

Then add `registerXxxHandlers()` to `apps/desktop/src/main/ipc/index.ts`.

`handle()` wraps the function so any thrown error becomes `{ ok: false, error: string }` and successes become `{ ok: true, data }`. The renderer never sees thrown errors as exceptions — instead, the preload converts non-`ok` results into thrown errors.

## 2. Preload bridge

File: `apps/desktop/src/preload/index.ts`

Add a method under the appropriate domain:

```ts
const api = {
  ...,
  xxx: {
    create: (platform: string, input: unknown) => invoke<unknown>("xxx.create", platform, input),
  },
};
```

The preload layer is intentionally untyped at value level — the typed contract lives in `api.d.ts`.

## 3. Typed contract

File: `apps/desktop/src/preload/api.d.ts`

```ts
export interface PlaybookApi {
  ...
  xxx: {
    create(platform: string, input: SomeInput): Promise<SomeEntity>;
  };
}
```

This file augments `window.api`. The renderer compiles against it.

## Channel naming

`<domain>.<verb>` — e.g. `clips.create`, `matches.pickVideoFile`, `video.exportPlaylist`.

## What goes where

- Pure CRUD on entities → call the use case from `@playbook/business-logic` directly.
- Native dialogs (`dialog.showOpenDialog`, `dialog.showSaveDialog`) → main only; the channel returns the user's choice as a plain string/null.
- ffmpeg → use the helpers in `apps/desktop/src/main/ffmpeg/`. Never call ffmpeg from the renderer.
