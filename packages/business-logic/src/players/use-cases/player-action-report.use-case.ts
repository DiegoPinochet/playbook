import { clipRepository } from "@playbook/file-system";
import { clipSchema, type ClipEntity } from "../../clips/clip.entity";

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
  const records = await clipRepository.list(platformFolder, opponentSlug, matchSlug);
  const allClips: ClipEntity[] = records.map((r) => clipSchema.parse(r));
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
