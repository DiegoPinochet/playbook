import {
  getPlatformSportUseCase,
  setPlatformSportUseCase,
  type Sport,
} from "@playbook/business-logic";
import { handle } from "./_helpers";

export function registerSportsHandlers(): void {
  handle<[string], Sport | null>("sports.getPlatformSport", (_e, platform) =>
    getPlatformSportUseCase(platform)
  );

  handle<[string, Sport], Sport>("sports.setPlatformSport", (_e, platform, sport) =>
    setPlatformSportUseCase(platform, sport)
  );
}
