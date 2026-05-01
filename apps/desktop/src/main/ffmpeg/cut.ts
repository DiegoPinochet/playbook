import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createFfmpegCommand } from "./runner";

export async function cutClip(opts: {
  inputVideoPath: string;
  outputPath: string;
  startSec: number;
  endSec: number;
}): Promise<void> {
  await mkdir(dirname(opts.outputPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    createFfmpegCommand(opts.inputVideoPath)
      .setStartTime(opts.startSec)
      .setDuration(opts.endSec - opts.startSec)
      .outputOptions(["-c copy", "-avoid_negative_ts make_zero"])
      .output(opts.outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

export async function concatClips(opts: {
  inputVideoPath: string;
  segments: Array<{ startSec: number; endSec: number }>;
  outputPath: string;
  workDir: string;
}): Promise<void> {
  await mkdir(opts.workDir, { recursive: true });
  const segmentPaths: string[] = [];
  for (let i = 0; i < opts.segments.length; i += 1) {
    const seg = opts.segments[i]!;
    const segPath = `${opts.workDir}/segment-${String(i).padStart(4, "0")}.mp4`;
    await cutClip({
      inputVideoPath: opts.inputVideoPath,
      outputPath: segPath,
      startSec: seg.startSec,
      endSec: seg.endSec,
    });
    segmentPaths.push(segPath);
  }
  const listFile = `${opts.workDir}/concat.txt`;
  await writeFile(
    listFile,
    segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
    "utf8"
  );
  await mkdir(dirname(opts.outputPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    createFfmpegCommand(listFile)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c copy"])
      .output(opts.outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}
