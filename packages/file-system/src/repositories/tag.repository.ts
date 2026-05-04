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
  async list(platform: string): Promise<TagRecord[]> {
    return (await readJson<TagRecord[]>(paths.globalTagsFile(platform))) ?? [];
  },

  async create(platform: string, record: TagRecord): Promise<void> {
    const all = await this.list(platform);
    all.push(record);
    await atomicWriteJson(paths.globalTagsFile(platform), all);
  },

  async update(platform: string, record: TagRecord): Promise<void> {
    const all = await this.list(platform);
    const next = all.map((t) => (t.id === record.id ? record : t));
    await atomicWriteJson(paths.globalTagsFile(platform), next);
  },

  async remove(platform: string, tagId: string): Promise<void> {
    const all = await this.list(platform);
    const next = all.filter((t) => t.id !== tagId);
    await atomicWriteJson(paths.globalTagsFile(platform), next);
  },
};
