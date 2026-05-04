import type { SportPreset } from "./index";

export const FOOTBALL_PRESET: SportPreset = {
  sport: "football",
  tags: [
    { id: "goal", label: "Goal", color: "#16a34a" },
    { id: "shot-on-target", label: "Shot on target", color: "#22c55e" },
    { id: "shot-off-target", label: "Shot off target", color: "#94a3b8" },
    { id: "corner", label: "Corner", color: "#3b82f6" },
    { id: "free-kick", label: "Free kick", color: "#60a5fa" },
    { id: "foul", label: "Foul", color: "#f97316" },
    { id: "offside", label: "Offside", color: "#facc15" },
    { id: "tackle", label: "Tackle", color: "#10b981" },
    { id: "pass", label: "Key pass", color: "#a855f7" },
    { id: "save", label: "Save", color: "#06b6d4" },
    { id: "yellow-card", label: "Yellow card", color: "#eab308" },
    { id: "red-card", label: "Red card", color: "#dc2626" },
    { id: "ours", label: "Ours", color: "#2563eb" },
    { id: "rivals", label: "Rivals", color: "#e11d48" },
  ],
};
