import { playerRepository } from "@playbook/file-system";
import { rosterSchema, type Roster } from "../player.entity";

export async function upsertRosterUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  roster: Roster
): Promise<void> {
  const parsed = rosterSchema.parse(roster);
  await playerRepository.write(platformFolder, opponentSlug, matchSlug, parsed);
}
