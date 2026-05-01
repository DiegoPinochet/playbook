import { mkdir, readdir, rm } from "node:fs/promises";
import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type ClipRecord = {
  id: string;
  matchId: string;
  title: string;
  description: string;
  startSec: number;
  endSec: number;
  tagIds: string[];
  playerNumbers: number[];
  createdAt: string;
};

async function listFiles(
  platform: string,
  opponentSlug: string,
  matchSlug: string
): Promise<string[]> {
  const dir = paths.clipsDir(platform, opponentSlug, matchSlug);
  await mkdir(dir, { recursive: true });
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name);
}

export const clipRepository = {
  async list(
    platform: string,
    opponentSlug: string,
    matchSlug: string
  ): Promise<ClipRecord[]> {
    const files = await listFiles(platform, opponentSlug, matchSlug);
    const records = await Promise.all(
      files.map((f) =>
        readJson<ClipRecord>(
          paths.clipFile(platform, opponentSlug, matchSlug, f.replace(/\.json$/, ""))
        )
      )
    );
    return records.filter((r): r is ClipRecord => r !== null);
  },

  async getById(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    clipId: string
  ): Promise<ClipRecord | null> {
    return readJson<ClipRecord>(paths.clipFile(platform, opponentSlug, matchSlug, clipId));
  },

  async create(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    record: ClipRecord
  ): Promise<void> {
    await atomicWriteJson(
      paths.clipFile(platform, opponentSlug, matchSlug, record.id),
      record
    );
  },

  async update(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    record: ClipRecord
  ): Promise<void> {
    await atomicWriteJson(
      paths.clipFile(platform, opponentSlug, matchSlug, record.id),
      record
    );
  },

  async remove(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    clipId: string
  ): Promise<void> {
    await rm(paths.clipFile(platform, opponentSlug, matchSlug, clipId), { force: true });
  },
};
