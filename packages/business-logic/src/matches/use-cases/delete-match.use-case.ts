import { matchRepository } from "@playbook/file-system";

export async function deleteMatchUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchId: string
): Promise<void> {
  await matchRepository.remove(platformFolder, opponentSlug, matchId);
}
