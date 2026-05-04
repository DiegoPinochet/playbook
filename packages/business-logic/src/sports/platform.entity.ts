import { z } from "zod";
import { sportSchema } from "./sport.entity";

export const platformConfigSchema = z.object({
  sport: sportSchema,
});

export type PlatformConfig = z.infer<typeof platformConfigSchema>;
