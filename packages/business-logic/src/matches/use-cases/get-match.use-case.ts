import { matchRepository } from "@playbook/file-system";
import type { MatchEntity } from "../match.entity";

export async function getMatchUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchId: string
): Promise<MatchEntity | null> {
  return matchRepository.getById(platformFolder, opponentSlug, matchId);
}
