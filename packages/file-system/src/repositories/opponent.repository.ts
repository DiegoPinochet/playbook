import { mkdir, readdir, rm } from "node:fs/promises";
import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type OpponentRecord = {
  id: string;
  name: string;
  slug: string;
  color: string;
  notes: string;
  createdAt: string;
};

async function listSlugs(platform: string): Promise<string[]> {
  await mkdir(platform, { recursive: true });
  const entries = await readdir(platform, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name);
}

export const opponentRepository = {
  async list(platform: string): Promise<OpponentRecord[]> {
    const slugs = await listSlugs(platform);
    const records = await Promise.all(
      slugs.map((slug) => readJson<OpponentRecord>(paths.opponentMetaFile(platform, slug)))
    );
    return records.filter((r): r is OpponentRecord => r !== null);
  },

  async getById(platform: string, opponentId: string): Promise<OpponentRecord | null> {
    const all = await this.list(platform);
    return all.find((o) => o.id === opponentId) ?? null;
  },

  async getBySlug(platform: string, slug: string): Promise<OpponentRecord | null> {
    return readJson<OpponentRecord>(paths.opponentMetaFile(platform, slug));
  },

  async create(platform: string, record: OpponentRecord): Promise<void> {
    await mkdir(paths.opponentDir(platform, record.slug), { recursive: true });
    await atomicWriteJson(paths.opponentMetaFile(platform, record.slug), record);
  },

  async update(platform: string, record: OpponentRecord): Promise<void> {
    await atomicWriteJson(paths.opponentMetaFile(platform, record.slug), record);
  },

  async remove(platform: string, opponentId: string): Promise<void> {
    const record = await this.getById(platform, opponentId);
    if (!record) return;
    await rm(paths.opponentDir(platform, record.slug), { recursive: true, force: true });
  },

  async uniqueSlug(platform: string, base: string): Promise<string> {
    const existing = new Set(await listSlugs(platform));
    if (!existing.has(base)) return base;
    let i = 2;
    while (existing.has(`${base}-${i}`)) i += 1;
    return `${base}-${i}`;
  },
};
