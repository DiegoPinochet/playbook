import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createFfmpegCommand } from "./runner";

export async function extractThumbnail(opts: {
  inputVideoPath: string;
  timestampSec: number;
  outputPath: string;
}): Promise<void> {
  await mkdir(dirname(opts.outputPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    createFfmpegCommand(opts.inputVideoPath)
      .setStartTime(opts.timestampSec)
      .frames(1)
      .output(opts.outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

export async function probeDurationSec(inputVideoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    createFfmpegCommand(inputVideoPath).ffprobe((err, data) => {
      if (err) return reject(err);
      const seconds = data.format?.duration;
      if (typeof seconds !== "number") return reject(new Error("Could not read video duration"));
      resolve(seconds);
    });
  });
}
