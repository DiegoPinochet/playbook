import { clipRepository } from "@playbook/file-system";
import type { ClipEntity } from "../../clips/clip.entity";

export type PlayerActionReportRow = {
  playerNumber: number;
  totalClips: number;
  countsByTag: Record<string, number>;
  clips: ClipEntity[];
};

export async function playerActionReportUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  playerNumbers: number[]
): Promise<PlayerActionReportRow[]> {
  const allClips = await clipRepository.list(platformFolder, opponentSlug, matchSlug);
  return playerNumbers.map((playerNumber) => {
    const clips = allClips.filter((c) => c.playerNumbers.includes(playerNumber));
    const countsByTag: Record<string, number> = {};
    for (const clip of clips) {
      for (const tagId of clip.tagIds) {
        countsByTag[tagId] = (countsByTag[tagId] ?? 0) + 1;
      }
    }
    return { playerNumber, totalClips: clips.length, countsByTag, clips };
  });
}
