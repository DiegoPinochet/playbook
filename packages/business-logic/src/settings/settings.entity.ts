import { z } from "zod";

export const settingsSchema = z.object({
  platformFolder: z.string().nullable(),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  /** Run the guided tour when a match editor opens. Cleared when the tour is finished or skipped. */
  tourEnabled: z.boolean().default(true),
});

export type SettingsEntity = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SettingsEntity = {
  platformFolder: null,
  theme: "system",
  tourEnabled: true,
};
