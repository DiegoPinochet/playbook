import { z } from "zod";

export const clipSchema = z
  .object({
    id: z.string().uuid(),
    matchId: z.string().uuid(),
    title: z.string().min(1).max(120),
    description: z.string().default(""),
    startSec: z.number().nonnegative(),
    endSec: z.number().positive(),
    tagIds: z.array(z.string()).default([]),
    playerNumbers: z.array(z.number().int().min(1).max(99)).default([]),
    createdAt: z.string().datetime(),
  })
  .refine((c) => c.endSec > c.startSec, {
    message: "endSec must be greater than startSec",
    path: ["endSec"],
  });

export type ClipEntity = z.infer<typeof clipSchema>;

export const clipCreateInputSchema = z.object({
  matchId: z.string().uuid(),
  title: z.string().min(1).max(120),
  description: z.string().optional(),
  startSec: z.number().nonnegative(),
  endSec: z.number().positive(),
  tagIds: z.array(z.string()).optional(),
  playerNumbers: z.array(z.number().int().min(1).max(99)).optional(),
});

export type ClipCreateInput = z.infer<typeof clipCreateInputSchema>;

export const clipUpdateInputSchema = clipCreateInputSchema.partial().extend({
  id: z.string().uuid(),
});

export type ClipUpdateInput = z.infer<typeof clipUpdateInputSchema>;

export type ClipFilter = {
  tagIds?: string[];
  playerNumbers?: number[];
  search?: string;
};
