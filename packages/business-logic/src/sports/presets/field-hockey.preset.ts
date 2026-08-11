import type { SportPreset } from "./index";

export const FIELD_HOCKEY_PRESET: SportPreset = {
  sport: "field-hockey",
  tags: [
    { id: "short-corner", label: "Short corner", color: "#3b82f6", group: "set-piece" },
    { id: "penalty-corner", label: "Penalty corner", color: "#60a5fa", group: "set-piece" },
    { id: "penalty-stroke", label: "Penalty stroke", color: "#a855f7", group: "set-piece" },
    { id: "circle-entry", label: "Circle entry", color: "#22c55e", group: "phase" },
    { id: "tackle", label: "Tackle", color: "#10b981", group: "phase" },
    { id: "interception", label: "Interception", color: "#06b6d4", group: "phase" },
    { id: "pass", label: "Key pass", color: "#facc15", group: "phase" },
    { id: "goal", label: "Goal", color: "#16a34a", group: "outcome" },
    { id: "foul", label: "Foul", color: "#f97316", group: "discipline" },
    { id: "green-card", label: "Green card", color: "#22c55e", group: "discipline" },
    { id: "yellow-card", label: "Yellow card", color: "#eab308", group: "discipline" },
    { id: "red-card", label: "Red card", color: "#dc2626", group: "discipline" },
    { id: "ours", label: "Ours", color: "#2563eb", group: "team" },
    { id: "rivals", label: "Rivals", color: "#e11d48", group: "team" },
  ],
};
