import { create } from "zustand";
import type { SettingsEntity, Sport } from "@playbook/business-logic";

type SettingsStore = {
  settings: SettingsEntity;
  platformSport: Sport | null;
  ready: boolean;
  load: () => Promise<void>;
  pickAndSetPlatformFolder: () => Promise<string | null>;
  setPlatformSport: (sport: Sport) => Promise<void>;
};

const DEFAULT: SettingsEntity = { platformFolder: null, theme: "system" };

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT,
  platformSport: null,
  ready: false,
  load: async () => {
    const settings = await window.api.settings.get();
    const platformSport = settings.platformFolder
      ? await window.api.sports.getPlatformSport(settings.platformFolder)
      : null;
    set({ settings, platformSport, ready: true });
  },
  pickAndSetPlatformFolder: async () => {
    const folder = await window.api.settings.pickPlatformFolder();
    if (!folder) return null;
    const settings = await window.api.settings.setPlatformFolder(folder);
    const platformSport = await window.api.sports.getPlatformSport(folder);
    set({ settings, platformSport });
    return folder;
  },
  setPlatformSport: async (sport) => {
    const platform = get().settings.platformFolder;
    if (!platform) throw new Error("Pick a platform folder first");
    const next = await window.api.sports.setPlatformSport(platform, sport);
    set({ platformSport: next });
  },
}));
