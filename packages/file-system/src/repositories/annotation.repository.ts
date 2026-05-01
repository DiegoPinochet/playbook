import { mkdir, readdir, rm } from "node:fs/promises";
import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type AnnotationRecord = {
  id: string;
  matchId: string;
  clipId: string | null;
  timestampSec: number;
  shapes: unknown[];
  thumbnailFileName: string;
  note: string;
  createdAt: string;
};

async function listFiles(
  platform: string,
  opponentSlug: string,
  matchSlug: string
): Promise<string[]> {
  const dir = paths.annotationsDir(platform, opponentSlug, matchSlug);
  await mkdir(dir, { recursive: true });
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name);
}

export const annotationRepository = {
  async list(
    platform: string,
    opponentSlug: string,
    matchSlug: string
  ): Promise<AnnotationRecord[]> {
    const files = await listFiles(platform, opponentSlug, matchSlug);
    const records = await Promise.all(
      files.map((f) =>
        readJson<AnnotationRecord>(
          paths.annotationFile(platform, opponentSlug, matchSlug, f.replace(/\.json$/, ""))
        )
      )
    );
    return records.filter((r): r is AnnotationRecord => r !== null);
  },

  async create(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    record: AnnotationRecord
  ): Promise<void> {
    await atomicWriteJson(
      paths.annotationFile(platform, opponentSlug, matchSlug, record.id),
      record
    );
  },

  async remove(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    annotationId: string
  ): Promise<void> {
    await rm(paths.annotationFile(platform, opponentSlug, matchSlug, annotationId), {
      force: true,
    });
  },
};
