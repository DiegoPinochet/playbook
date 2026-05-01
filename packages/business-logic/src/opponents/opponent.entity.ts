import { z } from "zod";

export const opponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3b82f6"),
  notes: z.string().default(""),
  createdAt: z.string().datetime(),
});

export type OpponentEntity = z.infer<typeof opponentSchema>;

export const opponentCreateInputSchema = opponentSchema
  .pick({ name: true, color: true, notes: true })
  .partial({ color: true, notes: true });

export type OpponentCreateInput = z.infer<typeof opponentCreateInputSchema>;
