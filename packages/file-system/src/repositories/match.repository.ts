import { mkdir, readdir, rm } from "node:fs/promises";
import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type MatchRecord = {
  id: string;
  opponentId: string;
  title: string;
  slug: string;
  date: string | null;
  venue: string | null;
  score: { for: number; against: number } | null;
  videoFileName: string;
  videoDurationSec: number | null;
  createdAt: string;
};

async function listSlugs(platform: string, opponentSlug: string): Promise<string[]> {
  await mkdir(paths.opponentDir(platform, opponentSlug), { recursive: true });
  const entries = await readdir(paths.opponentDir(platform, opponentSlug), {
    withFileTypes: true,
  });
  return entries.filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name);
}

export const matchRepository = {
  async list(platform: string, opponentSlug: string): Promise<MatchRecord[]> {
    const slugs = await listSlugs(platform, opponentSlug);
    const records = await Promise.all(
      slugs.map((slug) => readJson<MatchRecord>(paths.matchMetaFile(platform, opponentSlug, slug)))
    );
    return records.filter((r): r is MatchRecord => r !== null);
  },

  async getById(
    platform: string,
    opponentSlug: string,
    matchId: string
  ): Promise<MatchRecord | null> {
    const all = await this.list(platform, opponentSlug);
    return all.find((m) => m.id === matchId) ?? null;
  },

  async getBySlug(
    platform: string,
    opponentSlug: string,
    matchSlug: string
  ): Promise<MatchRecord | null> {
    return readJson<MatchRecord>(paths.matchMetaFile(platform, opponentSlug, matchSlug));
  },

  async create(platform: string, opponentSlug: string, record: MatchRecord): Promise<void> {
    await mkdir(paths.matchDir(platform, opponentSlug, record.slug), { recursive: true });
    await atomicWriteJson(
      paths.matchMetaFile(platform, opponentSlug, record.slug),
      record
    );
  },

  async update(platform: string, opponentSlug: string, record: MatchRecord): Promise<void> {
    await atomicWriteJson(
      paths.matchMetaFile(platform, opponentSlug, record.slug),
      record
    );
  },

  async remove(platform: string, opponentSlug: string, matchId: string): Promise<void> {
    const record = await this.getById(platform, opponentSlug, matchId);
    if (!record) return;
    await rm(paths.matchDir(platform, opponentSlug, record.slug), { recursive: true, force: true });
  },

  async uniqueSlug(platform: string, opponentSlug: string, base: string): Promise<string> {
    const existing = new Set(await listSlugs(platform, opponentSlug));
    if (!existing.has(base)) return base;
    let i = 2;
    while (existing.has(`${base}-${i}`)) i += 1;
    return `${base}-${i}`;
  },

  async ensureDirectory(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true });
  },
};
