import { tagRepository } from "@playbook/file-system";
import { DEFAULT_TAGS, type TagEntity } from "../tag.entity";

export async function listTagsUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string
): Promise<TagEntity[]> {
  const custom = await tagRepository.list(platformFolder, opponentSlug, matchSlug);
  const defaults = DEFAULT_TAGS.map((t) => ({ ...t, createdAt: new Date(0).toISOString() }));
  const customIds = new Set(custom.map((t) => t.id));
  return [...defaults.filter((d) => !customIds.has(d.id)), ...custom];
}
