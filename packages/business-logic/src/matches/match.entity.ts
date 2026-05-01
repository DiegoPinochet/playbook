import { z } from "zod";

export const matchScoreSchema = z.object({
  for: z.number().int().min(0),
  against: z.number().int().min(0),
});

export const matchSchema = z.object({
  id: z.string().uuid(),
  opponentId: z.string().uuid(),
  title: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  date: z.string().date().nullable(),
  venue: z.string().nullable(),
  score: matchScoreSchema.nullable(),
  videoFileName: z.string(),
  videoDurationSec: z.number().nonnegative().nullable(),
  createdAt: z.string().datetime(),
});

export type MatchEntity = z.infer<typeof matchSchema>;
export type MatchScore = z.infer<typeof matchScoreSchema>;

export const matchCreateInputSchema = z.object({
  opponentId: z.string().uuid(),
  title: z.string().min(1).max(120),
  date: z.string().date().nullable().optional(),
  venue: z.string().nullable().optional(),
  sourceVideoPath: z.string().min(1),
});

export type MatchCreateInput = z.infer<typeof matchCreateInputSchema>;
