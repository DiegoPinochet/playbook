import { annotationRepository } from "@playbook/file-system";
import { annotationSchema, type AnnotationEntity } from "../annotation.entity";

export async function listAnnotationsUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string
): Promise<AnnotationEntity[]> {
  const records = await annotationRepository.list(platformFolder, opponentSlug, matchSlug);
  return records.map((r) => annotationSchema.parse(r));
}
