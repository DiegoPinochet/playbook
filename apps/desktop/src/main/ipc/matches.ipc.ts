import { dialog, BrowserWindow } from "electron";
import {
  createMatchUseCase,
  deleteMatchUseCase,
  getMatchUseCase,
  importVideoUseCase,
  listMatchesUseCase,
  type MatchEntity,
} from "@playbook/business-logic";
import { paths, slugify } from "@playbook/file-system";
import { handle } from "./_helpers";

type CreateMatchPayload = {
  platform: string;
  opponentSlug: string;
  opponentId: string;
  title: string;
  date: string | null;
  venue: string | null;
  sourceVideoPath: string;
};

export function registerMatchesHandlers(): void {
  handle<[string, string], MatchEntity[]>("matches.list", (_e, platform, opponentSlug) =>
    listMatchesUseCase(platform, opponentSlug)
  );

  handle<[string, string, string], MatchEntity | null>(
    "matches.get",
    (_e, platform, opponentSlug, matchId) => getMatchUseCase(platform, opponentSlug, matchId)
  );

  handle<[CreateMatchPayload], MatchEntity>("matches.create", async (_e, payload) => {
    const slug = slugify(payload.date ? `${payload.date}-${payload.title}` : payload.title);
    const matchDir = paths.matchDir(payload.platform, payload.opponentSlug, slug);
    const imported = await importVideoUseCase({
      sourceVideoPath: payload.sourceVideoPath,
      destinationDir: matchDir,
    });
    return createMatchUseCase(payload.platform, payload.opponentSlug, {
      opponentId: payload.opponentId,
      title: payload.title,
      date: payload.date,
      venue: payload.venue,
      videoFileName: imported.fileName,
    });
  });

  handle<[string, string, string], void>(
    "matches.delete",
    (_e, platform, opponentSlug, matchId) => deleteMatchUseCase(platform, opponentSlug, matchId)
  );

  handle<[], string | null>("matches.pickVideoFile", async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const result = await dialog.showOpenDialog(window!, {
      title: "Choose match video",
      properties: ["openFile"],
      filters: [{ name: "Video", extensions: ["mp4", "mov", "m4v", "mkv", "webm"] }],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0] ?? null;
  });
}
