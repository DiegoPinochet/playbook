import { dialog, BrowserWindow } from "electron";
import { paths } from "@playbook/file-system";
import { handle } from "./_helpers";
import { cutClip, concatClips } from "../ffmpeg/cut";
import { extractThumbnail, probeDurationSec } from "../ffmpeg/thumbnail";

type ExportClipPayload = {
  platform: string;
  opponentSlug: string;
  matchSlug: string;
  videoFileName: string;
  startSec: number;
  endSec: number;
};

type ExportPlaylistPayload = {
  platform: string;
  opponentSlug: string;
  matchSlug: string;
  videoFileName: string;
  segments: Array<{ startSec: number; endSec: number }>;
};

export function registerVideoHandlers(): void {
  handle<[ExportClipPayload], string | null>("video.exportClip", async (event, payload) => {
    const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const result = await dialog.showSaveDialog(window!, {
      title: "Export clip as…",
      defaultPath: "clip.mp4",
      filters: [{ name: "MP4 video", extensions: ["mp4"] }],
    });
    if (result.canceled || !result.filePath) return null;
    const inputPath = `${paths.matchDir(payload.platform, payload.opponentSlug, payload.matchSlug)}/${payload.videoFileName}`;
    await cutClip({
      inputVideoPath: inputPath,
      outputPath: result.filePath,
      startSec: payload.startSec,
      endSec: payload.endSec,
    });
    return result.filePath;
  });

  handle<[ExportPlaylistPayload], string | null>(
    "video.exportPlaylist",
    async (event, payload) => {
      const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
      const result = await dialog.showSaveDialog(window!, {
        title: "Export playlist as…",
        defaultPath: "playlist.mp4",
        filters: [{ name: "MP4 video", extensions: ["mp4"] }],
      });
      if (result.canceled || !result.filePath) return null;
      const matchDir = paths.matchDir(payload.platform, payload.opponentSlug, payload.matchSlug);
      await concatClips({
        inputVideoPath: `${matchDir}/${payload.videoFileName}`,
        segments: payload.segments,
        outputPath: result.filePath,
        workDir: `${matchDir}/.tmp-export`,
      });
      return result.filePath;
    }
  );

  handle<
    [
      {
        platform: string;
        opponentSlug: string;
        matchSlug: string;
        videoFileName: string;
        timestampSec: number;
        outputFileName: string;
      },
    ],
    string
  >("video.thumbnail", async (_e, payload) => {
    const matchDir = paths.matchDir(payload.platform, payload.opponentSlug, payload.matchSlug);
    const inputPath = `${matchDir}/${payload.videoFileName}`;
    const outputPath = `${matchDir}/annotations/${payload.outputFileName}`;
    await extractThumbnail({
      inputVideoPath: inputPath,
      timestampSec: payload.timestampSec,
      outputPath,
    });
    return outputPath;
  });

  handle<[string], number>("video.probeDuration", async (_e, absolutePath) => {
    return probeDurationSec(absolutePath);
  });
}
