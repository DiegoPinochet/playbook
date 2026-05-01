import { opponentRepository } from "@playbook/file-system";
import type { OpponentEntity } from "../opponent.entity";

export async function listOpponentsUseCase(platformFolder: string): Promise<OpponentEntity[]> {
  return opponentRepository.list(platformFolder);
}
