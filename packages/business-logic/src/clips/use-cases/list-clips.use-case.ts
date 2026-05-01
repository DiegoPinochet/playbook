import { clipRepository } from "@playbook/file-system";
import type { ClipEntity } from "../clip.entity";

export async function listClipsUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string
): Promise<ClipEntity[]> {
  const clips = await clipRepository.list(platformFolder, opponentSlug, matchSlug);
  return clips.sort((a, b) => a.startSec - b.startSec);
}
