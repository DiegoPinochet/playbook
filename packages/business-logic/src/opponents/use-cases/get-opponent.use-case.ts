import { opponentRepository } from "@playbook/file-system";
import type { OpponentEntity } from "../opponent.entity";

export async function getOpponentUseCase(
  platformFolder: string,
  opponentId: string
): Promise<OpponentEntity | null> {
  return opponentRepository.getById(platformFolder, opponentId);
}
