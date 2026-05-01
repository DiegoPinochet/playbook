import { annotationRepository } from "@playbook/file-system";
import type { AnnotationEntity } from "../annotation.entity";

export async function listAnnotationsUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string
): Promise<AnnotationEntity[]> {
  return annotationRepository.list(platformFolder, opponentSlug, matchSlug);
}
