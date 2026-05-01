import { z } from "zod";

export const playerSchema = z.object({
  number: z.number().int().min(1).max(99),
  name: z.string().nullable(),
  position: z.string().nullable(),
});

export type PlayerEntity = z.infer<typeof playerSchema>;

export const rosterSchema = z.array(playerSchema);
export type Roster = z.infer<typeof rosterSchema>;
