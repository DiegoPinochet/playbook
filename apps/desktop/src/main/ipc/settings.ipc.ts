import { dialog, BrowserWindow } from "electron";
import {
  getSettingsUseCase,
  setPlatformFolderUseCase,
  type SettingsEntity,
} from "@playbook/business-logic";
import { handle, userDataDir } from "./_helpers";

export function registerSettingsHandlers(): void {
  handle<[], SettingsEntity>("settings.get", async () => {
    return getSettingsUseCase(userDataDir());
  });

  handle<[], string | null>("settings.pickPlatformFolder", async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const result = await dialog.showOpenDialog(window!, {
      title: "Choose your Playbook platform folder",
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0] ?? null;
  });

  handle<[string], SettingsEntity>("settings.setPlatformFolder", async (_e, platformFolder) => {
    return setPlatformFolderUseCase(userDataDir(), platformFolder);
  });
}
