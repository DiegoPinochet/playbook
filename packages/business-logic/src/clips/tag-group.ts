import { z } from "zod";

/** Fixed display order — the clip dialog and the match-editor tag rail both render in this order. */
export const TAG_GROUPS = [
  "set-piece",
  "phase",
  "outcome",
  "discipline",
  "team",
  "custom",
] as const;

export const tagGroupSchema = z.enum(TAG_GROUPS);
export type TagGroup = z.infer<typeof tagGroupSchema>;

export const DEFAULT_TAG_GROUP: TagGroup = "custom";

export const TAG_GROUP_LABELS: Record<TagGroup, string> = {
  "set-piece": "Set piece",
  phase: "Phase play",
  outcome: "Outcome",
  discipline: "Discipline",
  team: "Team",
  custom: "Your tags",
};

/** Groups tags in TAG_GROUPS order, dropping groups with no tags. */
export function groupTags<T extends { group: TagGroup }>(
  tags: T[]
): Array<{ group: TagGroup; label: string; tags: T[] }> {
  return TAG_GROUPS.map((group) => ({
    group,
    label: TAG_GROUP_LABELS[group],
    tags: tags.filter((t) => t.group === group),
  })).filter((entry) => entry.tags.length > 0);
}
