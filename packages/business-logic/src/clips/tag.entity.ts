import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
});

export type TagEntity = z.infer<typeof tagSchema>;

export const DEFAULT_TAGS: ReadonlyArray<Omit<TagEntity, "createdAt">> = [
  { id: "lineout", label: "Lineout", color: "#3b82f6", isDefault: true },
  { id: "scrum", label: "Scrum", color: "#eab308", isDefault: true },
  { id: "breakdown", label: "Breakdown", color: "#22c55e", isDefault: true },
  { id: "attack", label: "Attack", color: "#ef4444", isDefault: true },
  { id: "defence", label: "Defence", color: "#f97316", isDefault: true },
  { id: "kicking", label: "Kicking", color: "#facc15", isDefault: true },
  { id: "set-piece", label: "Set-piece", color: "#60a5fa", isDefault: true },
  { id: "turnover", label: "Turnover", color: "#10b981", isDefault: true },
  { id: "try", label: "Try", color: "#16a34a", isDefault: true },
  { id: "missed-tackle", label: "Missed tackle", color: "#dc2626", isDefault: true },
  { id: "linebreak", label: "Linebreak", color: "#fb7185", isDefault: true },
  { id: "ours", label: "Ours", color: "#2563eb", isDefault: true },
  { id: "rivals", label: "Rivals", color: "#e11d48", isDefault: true },
] as const;

export const DEFAULT_TAG_IDS: ReadonlySet<string> = new Set(DEFAULT_TAGS.map((t) => t.id));
