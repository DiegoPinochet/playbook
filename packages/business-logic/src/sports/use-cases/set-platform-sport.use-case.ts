import {
  platformRepository,
  opponentRepository,
  matchRepository,
  clipRepository,
} from "@playbook/file-system";
import { sportSchema, type Sport } from "../sport.entity";

export async function setPlatformSportUseCase(platform: string, sport: Sport): Promise<Sport> {
  const parsed = sportSchema.parse(sport);
  const current = await platformRepository.read(platform);
  if (current?.sport && current.sport !== parsed) {
    const opponents = await opponentRepository.list(platform);
    for (const opp of opponents) {
      const matches = await matchRepository.list(platform, opp.slug);
      for (const match of matches) {
        const clips = await clipRepository.list(platform, opp.slug, match.slug);
        if (clips.length > 0) {
          throw new Error(
            "Sport is locked once any clip exists. Create a new platform folder to use a different sport."
          );
        }
      }
    }
  }
  await platformRepository.write(platform, { sport: parsed });
  return parsed;
}
