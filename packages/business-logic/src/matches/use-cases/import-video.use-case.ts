import { extname } from "node:path";
import { copyFile, stat } from "node:fs/promises";
import { matchRepository } from "@playbook/file-system";

export type ImportVideoInput = {
  sourceVideoPath: string;
  destinationDir: string;
};

export type ImportedVideo = {
  fileName: string;
  sizeBytes: number;
};

const SUPPORTED_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".mkv", ".webm"]);

export async function importVideoUseCase(input: ImportVideoInput): Promise<ImportedVideo> {
  const ext = extname(input.sourceVideoPath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported video format: ${ext}`);
  }
  const fileName = `video${ext}`;
  await matchRepository.ensureDirectory(input.destinationDir);
  const destination = `${input.destinationDir}/${fileName}`;
  await copyFile(input.sourceVideoPath, destination);
  const stats = await stat(destination);
  return { fileName, sizeBytes: stats.size };
}
