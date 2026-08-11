import { settingsRepository } from "@playbook/file-system";
import { type SettingsEntity } from "../settings.entity";
import { getSettingsUseCase } from "./get-settings.use-case";

export async function setTourEnabledUseCase(
  userDataDir: string,
  tourEnabled: boolean
): Promise<SettingsEntity> {
  const current = await getSettingsUseCase(userDataDir);
  const next: SettingsEntity = { ...current, tourEnabled };
  await settingsRepository.write(userDataDir, next);
  return next;
}
