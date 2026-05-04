import { z } from "zod";

export const sportSchema = z.enum(["rugby", "football", "field-hockey"]);
export type Sport = z.infer<typeof sportSchema>;

export const SPORT_LABELS: Record<Sport, string> = {
  rugby: "Rugby",
  football: "Football",
  "field-hockey": "Field Hockey",
};

export const SPORT_DESCRIPTIONS: Record<Sport, string> = {
  rugby: "Lineouts, scrums, breakdowns, kicking — the union taxonomy.",
  football: "Goals, shots, set pieces, fouls, cards.",
  "field-hockey": "Short corners, penalty corners, circle entries, cards.",
};

export const ALL_SPORTS: ReadonlyArray<Sport> = ["rugby", "football", "field-hockey"];
