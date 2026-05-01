import { app, ipcMain, type IpcMainInvokeEvent } from "electron";

export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function userDataDir(): string {
  return app.getPath("userData");
}

export function handle<TArgs extends unknown[], TResult>(
  channel: string,
  fn: (event: IpcMainInvokeEvent, ...args: TArgs) => Promise<TResult>
): void {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      const data = await fn(event, ...(args as TArgs));
      return { ok: true, data } satisfies IpcResult<TResult>;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`[ipc:${channel}]`, err);
      return { ok: false, error } satisfies IpcResult<TResult>;
    }
  });
}
