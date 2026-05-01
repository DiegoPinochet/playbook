import { tagRepository, slugify } from "@playbook/file-system";
import { DEFAULT_TAG_IDS, tagSchema, type TagEntity } from "../tag.entity";

export type CreateCustomTagInput = {
  label: string;
  color?: string;
};

export async function createCustomTagUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  input: CreateCustomTagInput
): Promise<TagEntity> {
  const id = slugify(input.label);
  if (DEFAULT_TAG_IDS.has(id)) {
    throw new Error(`Tag "${id}" is a default tag`);
  }
  const existing = await tagRepository.list(platformFolder, opponentSlug, matchSlug);
  if (existing.some((t) => t.id === id)) {
    throw new Error(`Tag "${id}" already exists`);
  }
  const entity = tagSchema.parse({
    id,
    label: input.label.trim(),
    color: input.color ?? "#94a3b8",
    isDefault: false,
    createdAt: new Date().toISOString(),
  });
  await tagRepository.create(platformFolder, opponentSlug, matchSlug, entity);
  return entity;
}
