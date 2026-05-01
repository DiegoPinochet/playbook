import { annotationRepository } from "@playbook/file-system";

export async function deleteAnnotationUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  annotationId: string
): Promise<void> {
  await annotationRepository.remove(platformFolder, opponentSlug, matchSlug, annotationId);
}
