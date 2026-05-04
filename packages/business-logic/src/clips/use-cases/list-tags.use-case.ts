import { tagRepository } from "@playbook/file-system";
import type { TagEntity } from "../tag.entity";
import { getPlatformSportUseCase } from "../../sports/use-cases/get-platform-sport.use-case";
import { SPORT_PRESETS } from "../../sports/presets";

const PRESET_CREATED_AT = new Date(0).toISOString();

export async function listTagsUseCase(platformFolder: string): Promise<TagEntity[]> {
  const sport = await getPlatformSportUseCase(platformFolder);
  if (!sport) return [];

  const presets: TagEntity[] = SPORT_PRESETS[sport].tags.map((t) => ({
    id: t.id,
    label: t.label,
    color: t.color,
    isDefault: true,
    createdAt: PRESET_CREATED_AT,
  }));

  const presetIds = new Set(presets.map((t) => t.id));
  const customs = await tagRepository.list(platformFolder);
  const visibleCustoms = customs.filter((c) => !presetIds.has(c.id));

  return [...presets, ...visibleCustoms];
}
