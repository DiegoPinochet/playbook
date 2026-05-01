import { settingsRepository } from "@playbook/file-system";
import { DEFAULT_SETTINGS, type SettingsEntity } from "../settings.entity";

export async function getSettingsUseCase(userDataDir: string): Promise<SettingsEntity> {
  const stored = await settingsRepository.read(userDataDir);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}
