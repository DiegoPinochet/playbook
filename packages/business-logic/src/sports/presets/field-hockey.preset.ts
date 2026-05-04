import type { SportPreset } from "./index";

export const FIELD_HOCKEY_PRESET: SportPreset = {
  sport: "field-hockey",
  tags: [
    { id: "goal", label: "Goal", color: "#16a34a" },
    { id: "short-corner", label: "Short corner", color: "#3b82f6" },
    { id: "penalty-corner", label: "Penalty corner", color: "#60a5fa" },
    { id: "penalty-stroke", label: "Penalty stroke", color: "#a855f7" },
    { id: "circle-entry", label: "Circle entry", color: "#22c55e" },
    { id: "tackle", label: "Tackle", color: "#10b981" },
    { id: "interception", label: "Interception", color: "#06b6d4" },
    { id: "pass", label: "Key pass", color: "#facc15" },
    { id: "foul", label: "Foul", color: "#f97316" },
    { id: "green-card", label: "Green card", color: "#22c55e" },
    { id: "yellow-card", label: "Yellow card", color: "#eab308" },
    { id: "red-card", label: "Red card", color: "#dc2626" },
    { id: "ours", label: "Ours", color: "#2563eb" },
    { id: "rivals", label: "Rivals", color: "#e11d48" },
  ],
};
