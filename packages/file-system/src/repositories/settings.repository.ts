import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type SettingsRecord = {
  platformFolder: string | null;
  theme: "light" | "dark" | "system";
};

export const settingsRepository = {
  async read(userDataDir: string): Promise<SettingsRecord | null> {
    return readJson<SettingsRecord>(paths.settingsFile(userDataDir));
  },

  async write(userDataDir: string, value: SettingsRecord): Promise<void> {
    await atomicWriteJson(paths.settingsFile(userDataDir), value);
  },
};
