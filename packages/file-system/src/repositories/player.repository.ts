import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type PlayerRecord = {
  number: number;
  name: string | null;
  position: string | null;
};

export const playerRepository = {
  async read(
    platform: string,
    opponentSlug: string,
    matchSlug: string
  ): Promise<PlayerRecord[]> {
    return (
      (await readJson<PlayerRecord[]>(paths.playersFile(platform, opponentSlug, matchSlug))) ?? []
    );
  },

  async write(
    platform: string,
    opponentSlug: string,
    matchSlug: string,
    roster: PlayerRecord[]
  ): Promise<void> {
    await atomicWriteJson(paths.playersFile(platform, opponentSlug, matchSlug), roster);
  },
};
