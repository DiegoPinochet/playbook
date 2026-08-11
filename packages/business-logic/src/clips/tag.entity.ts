import { z } from "zod";
import { DEFAULT_TAG_GROUP, tagGroupSchema } from "./tag-group";

export const tagSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  group: tagGroupSchema.default(DEFAULT_TAG_GROUP),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
});

export type TagEntity = z.infer<typeof tagSchema>;
