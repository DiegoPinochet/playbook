import { randomUUID } from "node:crypto";
import { clipRepository } from "@playbook/file-system";
import { clipCreateInputSchema, type ClipCreateInput, type ClipEntity } from "../clip.entity";

export async function createClipUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  input: ClipCreateInput
): Promise<ClipEntity> {
  const parsed = clipCreateInputSchema.parse(input);
  if (parsed.endSec <= parsed.startSec) {
    throw new Error("Clip end must be after start");
  }
  const entity: ClipEntity = {
    id: randomUUID(),
    matchId: parsed.matchId,
    title: parsed.title,
    description: parsed.description ?? "",
    startSec: parsed.startSec,
    endSec: parsed.endSec,
    tagIds: parsed.tagIds ?? [],
    playerNumbers: parsed.playerNumbers ?? [],
    starred: false,
    createdAt: new Date().toISOString(),
  };
  await clipRepository.create(platformFolder, opponentSlug, matchSlug, entity);
  return entity;
}
