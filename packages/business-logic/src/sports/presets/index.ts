import type { Sport } from "../sport.entity";
import { RUGBY_PRESET } from "./rugby.preset";
import { FOOTBALL_PRESET } from "./football.preset";
import { FIELD_HOCKEY_PRESET } from "./field-hockey.preset";

export type PresetTag = { id: string; label: string; color: string };

export type SportPreset = {
  sport: Sport;
  tags: ReadonlyArray<PresetTag>;
};

export const SPORT_PRESETS: Record<Sport, SportPreset> = {
  rugby: RUGBY_PRESET,
  football: FOOTBALL_PRESET,
  "field-hockey": FIELD_HOCKEY_PRESET,
};

export function presetTagIds(sport: Sport): ReadonlySet<string> {
  return new Set(SPORT_PRESETS[sport].tags.map((t) => t.id));
}
