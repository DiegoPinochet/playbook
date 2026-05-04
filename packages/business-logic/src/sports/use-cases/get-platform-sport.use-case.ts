import { platformRepository } from "@playbook/file-system";
import { sportSchema, type Sport } from "../sport.entity";

export async function getPlatformSportUseCase(platform: string): Promise<Sport | null> {
  const config = await platformRepository.read(platform);
  if (!config) return null;
  const parsed = sportSchema.safeParse(config.sport);
  return parsed.success ? parsed.data : null;
}
