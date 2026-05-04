import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type PlatformConfigRecord = {
  sport: string;
};

export const platformRepository = {
  async read(platform: string): Promise<PlatformConfigRecord | null> {
    return readJson<PlatformConfigRecord>(paths.platformConfigFile(platform));
  },

  async write(platform: string, value: PlatformConfigRecord): Promise<void> {
    await atomicWriteJson(paths.platformConfigFile(platform), value);
  },
};
