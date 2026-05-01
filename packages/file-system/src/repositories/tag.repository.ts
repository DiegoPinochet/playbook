import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type TagRecord = {
  id: string;
  label: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
};

export const tagRepository = {
  async list(
    platform: string,
    opponentSlug: string,
    matchSlug: string
  ): Promise<TagRecord[]> {
    return (
      (await readJson<TagRecord[]>(paths.tagsFile(platform, opponentSlug, matchSlug))) ?? []
    );
  },

  async create(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    record: TagRecord
  ): Promise<void> {
    const all = await this.list(platform, opponentSlug, matchSlug);
    all.push(record);
    await atomicWriteJson(paths.tagsFile(platform, opponentSlug, matchSlug), all);
  },

  async remove(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    tagId: string
  ): Promise<void> {
    const all = await this.list(platform, opponentSlug, matchSlug);
    const next = all.filter((t) => t.id !== tagId);
    await atomicWriteJson(paths.tagsFile(platform, opponentSlug, matchSlug), next);
  },
};
