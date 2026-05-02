import { contextBridge, ipcRenderer } from "electron";

type IpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = (await ipcRenderer.invoke(channel, ...args)) as IpcResult<T>;
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

const api = {
  settings: {
    get: () => invoke<unknown>("settings.get"),
    pickPlatformFolder: () => invoke<string | null>("settings.pickPlatformFolder"),
    setPlatformFolder: (folder: string) => invoke<unknown>("settings.setPlatformFolder", folder),
  },
  opponents: {
    list: (platform: string) => invoke<unknown[]>("opponents.list", platform),
    get: (platform: string, id: string) => invoke<unknown>("opponents.get", platform, id),
    create: (platform: string, input: unknown) =>
      invoke<unknown>("opponents.create", platform, input),
    update: (platform: string, input: unknown) =>
      invoke<unknown>("opponents.update", platform, input),
    delete: (platform: string, id: string) => invoke<void>("opponents.delete", platform, id),
  },
  matches: {
    list: (platform: string, opponentSlug: string) =>
      invoke<unknown[]>("matches.list", platform, opponentSlug),
    get: (platform: string, opponentSlug: string, matchId: string) =>
      invoke<unknown>("matches.get", platform, opponentSlug, matchId),
    create: (payload: unknown) => invoke<unknown>("matches.create", payload),
    delete: (platform: string, opponentSlug: string, matchId: string) =>
      invoke<void>("matches.delete", platform, opponentSlug, matchId),
    pickVideoFile: () => invoke<string | null>("matches.pickVideoFile"),
  },
  clips: {
    list: (platform: string, opponentSlug: string, matchSlug: string) =>
      invoke<unknown[]>("clips.list", platform, opponentSlug, matchSlug),
    create: (platform: string, opponentSlug: string, matchSlug: string, input: unknown) =>
      invoke<unknown>("clips.create", platform, opponentSlug, matchSlug, input),
    update: (platform: string, opponentSlug: string, matchSlug: string, input: unknown) =>
      invoke<unknown>("clips.update", platform, opponentSlug, matchSlug, input),
    delete: (platform: string, opponentSlug: string, matchSlug: string, clipId: string) =>
      invoke<void>("clips.delete", platform, opponentSlug, matchSlug, clipId),
    listTags: (platform: string, opponentSlug: string, matchSlug: string) =>
      invoke<unknown[]>("clips.listTags", platform, opponentSlug, matchSlug),
    createCustomTag: (
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      input: unknown
    ) => invoke<unknown>("clips.createCustomTag", platform, opponentSlug, matchSlug, input),
  },
  players: {
    list: (platform: string, opponentSlug: string, matchSlug: string) =>
      invoke<unknown[]>("players.list", platform, opponentSlug, matchSlug),
    upsert: (platform: string, opponentSlug: string, matchSlug: string, roster: unknown) =>
      invoke<void>("players.upsert", platform, opponentSlug, matchSlug, roster),
    report: (
      platform: string,
      opponentSlug: string,
      matchSlug: string,
      playerNumbers: number[]
    ) => invoke<unknown[]>("players.report", platform, opponentSlug, matchSlug, playerNumbers),
  },
  annotations: {
    list: (platform: string, opponentSlug: string, matchSlug: string) =>
      invoke<unknown[]>("annotations.list", platform, opponentSlug, matchSlug),
    save: (platform: string, opponentSlug: string, matchSlug: string, input: unknown) =>
      invoke<unknown>("annotations.save", platform, opponentSlug, matchSlug, input),
    delete: (platform: string, opponentSlug: string, matchSlug: string, id: string) =>
      invoke<void>("annotations.delete", platform, opponentSlug, matchSlug, id),
  },
  video: {
    exportClip: (payload: unknown) => invoke<string | null>("video.exportClip", payload),
    exportPlaylist: (payload: unknown) => invoke<string | null>("video.exportPlaylist", payload),
    thumbnail: (payload: unknown) => invoke<string>("video.thumbnail", payload),
    probeDuration: (absolutePath: string) => invoke<number>("video.probeDuration", absolutePath),
  },
};

contextBridge.exposeInMainWorld("api", api);

export type ApiBridge = typeof api;
