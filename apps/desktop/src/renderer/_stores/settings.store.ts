import { create } from "zustand";
import type { SettingsEntity } from "@playbook/business-logic";

type SettingsStore = {
  settings: SettingsEntity;
  ready: boolean;
  load: () => Promise<void>;
  pickAndSetPlatformFolder: () => Promise<string | null>;
};

const DEFAULT: SettingsEntity = { platformFolder: null, theme: "system" };

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULT,
  ready: false,
  load: async () => {
    const settings = await window.api.settings.get();
    set({ settings, ready: true });
  },
  pickAndSetPlatformFolder: async () => {
    const folder = await window.api.settings.pickPlatformFolder();
    if (!folder) return null;
    const settings = await window.api.settings.setPlatformFolder(folder);
    set({ settings });
    return folder;
  },
}));
