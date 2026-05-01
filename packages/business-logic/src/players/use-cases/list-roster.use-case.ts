import { playerRepository } from "@playbook/file-system";
import type { Roster } from "../player.entity";

export async function listRosterUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string
): Promise<Roster> {
  return playerRepository.read(platformFolder, opponentSlug, matchSlug);
}
