import {
  listRosterUseCase,
  playerActionReportUseCase,
  upsertRosterUseCase,
  type PlayerActionReportRow,
  type Roster,
} from "@playbook/business-logic";
import { handle } from "./_helpers";

export function registerPlayersHandlers(): void {
  handle<[string, string, string], Roster>(
    "players.list",
    (_e, platform, opponentSlug, matchSlug) => listRosterUseCase(platform, opponentSlug, matchSlug)
  );

  handle<[string, string, string, Roster], void>(
    "players.upsert",
    (_e, platform, opponentSlug, matchSlug, roster) =>
      upsertRosterUseCase(platform, opponentSlug, matchSlug, roster)
  );

  handle<[string, string, string, number[]], PlayerActionReportRow[]>(
    "players.report",
    (_e, platform, opponentSlug, matchSlug, playerNumbers) =>
      playerActionReportUseCase(platform, opponentSlug, matchSlug, playerNumbers)
  );
}
