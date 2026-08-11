import { z } from "zod";

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

export const TAG_GROUP_LABELS: Record<TagGroup, string> = {
  "set-piece": "Set piece",
  phase: "Phase play",
  outcome: "Outcome",
  discipline: "Discipline",
  team: "Team",
  custom: "Your tags",
};

/** One-line explanation per group. The onboarding tour reads these too. */
export const TAG_GROUP_PURPOSE: Record<TagGroup, string> = {
  "set-piece": "Restarts and dead-ball situations",
  phase: "What happens in open play",
  outcome: "How the passage ended",
  discipline: "Fouls, offside, cards",
  team: "Whose passage this was",
  custom: "Tags you created for this platform",
};

export const TAG_GROUP_ORDER: ReadonlyArray<TagGroup> = TAG_GROUPS;

export const DEFAULT_TAG_GROUP: TagGroup = "custom";

/** Groups tags in TAG_GROUP_ORDER, dropping groups with no tags. */
export function groupTags<T extends { group: TagGroup }>(
  tags: T[]
): Array<{ group: TagGroup; label: string; tags: T[] }> {
  return TAG_GROUP_ORDER.map((group) => ({
    group,
    label: TAG_GROUP_LABELS[group],
    tags: tags.filter((t) => t.group === group),
  })).filter((entry) => entry.tags.length > 0);
}
