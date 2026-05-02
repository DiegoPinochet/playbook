import { clipRepository } from "@playbook/file-system";
import { clipSchema, type ClipEntity } from "../clip.entity";

export async function listClipsUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string
): Promise<ClipEntity[]> {
  const records = await clipRepository.list(platformFolder, opponentSlug, matchSlug);
  return records
    .map((r) => clipSchema.parse(r))
    .sort((a, b) => a.startSec - b.startSec);
}
