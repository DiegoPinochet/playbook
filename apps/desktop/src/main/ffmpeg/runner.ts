import { app } from "electron";
import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

export function ffmpegBinary(): string {
  if (!ffmpegStatic) {
    throw new Error("ffmpeg-static binary not found");
  }
  // In a packaged app the binary lives inside app.asar.unpacked
  return app.isPackaged
    ? ffmpegStatic.replace("app.asar", "app.asar.unpacked")
    : ffmpegStatic;
}

export function createFfmpegCommand(input: string) {
  return ffmpeg(input).setFfmpegPath(ffmpegBinary());
}
