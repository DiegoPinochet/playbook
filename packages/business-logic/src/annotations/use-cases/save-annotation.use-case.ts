import { randomUUID } from "node:crypto";
import { annotationRepository } from "@playbook/file-system";
import {
  annotationCreateInputSchema,
  type AnnotationCreateInput,
  type AnnotationEntity,
} from "../annotation.entity";

export async function saveAnnotationUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  input: AnnotationCreateInput
): Promise<AnnotationEntity> {
  const parsed = annotationCreateInputSchema.parse(input);
  const entity: AnnotationEntity = {
    id: randomUUID(),
    matchId: parsed.matchId,
    clipId: parsed.clipId ?? null,
    timestampSec: parsed.timestampSec,
    shapes: parsed.shapes,
    thumbnailFileName: parsed.thumbnailFileName,
    note: parsed.note ?? "",
    createdAt: new Date().toISOString(),
  };
  await annotationRepository.create(platformFolder, opponentSlug, matchSlug, entity);
  return entity;
}
