import { randomUUID } from "node:crypto";
import { matchRepository, slugify } from "@playbook/file-system";
import {
  matchCreateInputSchema,
  type MatchCreateInput,
  type MatchEntity,
} from "../match.entity";

export async function createMatchUseCase(
  platformFolder: string,
  opponentSlug: string,
  input: Omit<MatchCreateInput, "sourceVideoPath"> & { videoFileName: string }
): Promise<MatchEntity> {
  const parsed = matchCreateInputSchema
    .omit({ sourceVideoPath: true })
    .parse({ opponentId: input.opponentId, title: input.title, date: input.date, venue: input.venue });

  const seedSlug = parsed.date ? `${parsed.date}-${parsed.title}` : parsed.title;
  const slug = await matchRepository.uniqueSlug(platformFolder, opponentSlug, slugify(seedSlug));

  const entity: MatchEntity = {
    id: randomUUID(),
    opponentId: parsed.opponentId,
    title: parsed.title,
    slug,
    date: parsed.date ?? null,
    venue: parsed.venue ?? null,
    score: null,
    videoFileName: input.videoFileName,
    videoDurationSec: null,
    createdAt: new Date().toISOString(),
  };
  await matchRepository.create(platformFolder, opponentSlug, entity);
  return entity;
}
