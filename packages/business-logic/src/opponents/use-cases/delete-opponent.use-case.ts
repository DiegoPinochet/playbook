import { opponentRepository } from "@playbook/file-system";

export async function deleteOpponentUseCase(
  platformFolder: string,
  opponentId: string
): Promise<void> {
  await opponentRepository.remove(platformFolder, opponentId);
}
