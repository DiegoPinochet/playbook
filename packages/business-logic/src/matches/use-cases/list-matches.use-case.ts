import { matchRepository } from "@playbook/file-system";
import type { MatchEntity } from "../match.entity";

export async function listMatchesUseCase(
  platformFolder: string,
  opponentSlug: string
): Promise<MatchEntity[]> {
  return matchRepository.list(platformFolder, opponentSlug);
}
