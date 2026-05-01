import { z } from "zod";

export const settingsSchema = z.object({
  platformFolder: z.string().nullable(),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

export type SettingsEntity = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SettingsEntity = {
  platformFolder: null,
  theme: "system",
};
