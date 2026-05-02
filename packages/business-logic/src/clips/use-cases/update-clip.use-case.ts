import { clipRepository } from "@playbook/file-system";
import {
  clipSchema,
  clipUpdateInputSchema,
  type ClipEntity,
  type ClipUpdateInput,
} from "../clip.entity";

export async function updateClipUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  input: ClipUpdateInput
): Promise<ClipEntity> {
  const parsed = clipUpdateInputSchema.parse(input);
  const raw = await clipRepository.getById(platformFolder, opponentSlug, matchSlug, parsed.id);
  if (!raw) {
    throw new Error(`Clip not found: ${parsed.id}`);
  }
  const existing = clipSchema.parse(raw);
  const next: ClipEntity = {
    ...existing,
    title: parsed.title ?? existing.title,
    description: parsed.description ?? existing.description,
    startSec: parsed.startSec ?? existing.startSec,
    endSec: parsed.endSec ?? existing.endSec,
    tagIds: parsed.tagIds ?? existing.tagIds,
    playerNumbers: parsed.playerNumbers ?? existing.playerNumbers,
    starred: parsed.starred ?? existing.starred,
  };
  if (next.endSec <= next.startSec) {
    throw new Error("Clip end must be after start");
  }
  await clipRepository.update(platformFolder, opponentSlug, matchSlug, next);
  return next;
}
