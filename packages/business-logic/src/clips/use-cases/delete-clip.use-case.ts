import { clipRepository } from "@playbook/file-system";

export async function deleteClipUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  clipId: string
): Promise<void> {
  await clipRepository.remove(platformFolder, opponentSlug, matchSlug, clipId);
}
