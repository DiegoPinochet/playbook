import { tagRepository, slugify } from "@playbook/file-system";
import { tagSchema, type TagEntity } from "../tag.entity";
import { DEFAULT_TAG_COLOR, isPaletteColor } from "../tag-color";
import { DEFAULT_TAG_GROUP, tagGroupSchema, type TagGroup } from "../tag-group";
import { getPlatformSportUseCase } from "../../sports/use-cases/get-platform-sport.use-case";
import { presetTagIds } from "../../sports/presets";

export type CreateCustomTagInput = {
  label: string;
  color?: string;
  group?: TagGroup;
};

export async function createCustomTagUseCase(
  platformFolder: string,
  input: CreateCustomTagInput
): Promise<TagEntity> {
  const id = slugify(input.label);
  if (!id) throw new Error("Tag label is empty");

  const sport = await getPlatformSportUseCase(platformFolder);
  if (sport && presetTagIds(sport).has(id)) {
    throw new Error(`Tag "${id}" is reserved by the ${sport} preset`);
  }

  const existing = await tagRepository.list(platformFolder);
  if (existing.some((t) => t.id === id)) {
    throw new Error(`Tag "${id}" already exists`);
  }

  const color = input.color ?? DEFAULT_TAG_COLOR;
  if (!isPaletteColor(color)) {
    throw new Error("Tag color must be one of the palette swatches");
  }

  const group = input.group ? tagGroupSchema.parse(input.group) : DEFAULT_TAG_GROUP;

  const entity = tagSchema.parse({
    id,
    label: input.label.trim(),
    color,
    group,
    isDefault: false,
    createdAt: new Date().toISOString(),
  });
  await tagRepository.create(platformFolder, entity);
  return entity;
}
