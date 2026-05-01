import { mkdir, stat } from "node:fs/promises";
import { settingsRepository } from "@playbook/file-system";
import { type SettingsEntity } from "../settings.entity";
import { getSettingsUseCase } from "./get-settings.use-case";

export async function setPlatformFolderUseCase(
  userDataDir: string,
  platformFolder: string
): Promise<SettingsEntity> {
  const info = await stat(platformFolder).catch(() => null);
  if (info && !info.isDirectory()) {
    throw new Error("Platform folder path exists but is not a directory");
  }
  if (!info) {
    await mkdir(platformFolder, { recursive: true });
  }
  const current = await getSettingsUseCase(userDataDir);
  const next: SettingsEntity = { ...current, platformFolder };
  await settingsRepository.write(userDataDir, next);
  return next;
}
