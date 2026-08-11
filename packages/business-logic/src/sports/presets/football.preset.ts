import type { SportPreset } from "./index";

export const FOOTBALL_PRESET: SportPreset = {
  sport: "football",
  tags: [
    { id: "corner", label: "Corner", color: "#3b82f6", group: "set-piece" },
    { id: "free-kick", label: "Free kick", color: "#60a5fa", group: "set-piece" },
    { id: "tackle", label: "Tackle", color: "#10b981", group: "phase" },
    { id: "pass", label: "Key pass", color: "#a855f7", group: "phase" },
    { id: "save", label: "Save", color: "#06b6d4", group: "phase" },
    { id: "goal", label: "Goal", color: "#16a34a", group: "outcome" },
    { id: "shot-on-target", label: "Shot on target", color: "#22c55e", group: "outcome" },
    { id: "shot-off-target", label: "Shot off target", color: "#94a3b8", group: "outcome" },
    { id: "foul", label: "Foul", color: "#f97316", group: "discipline" },
    { id: "offside", label: "Offside", color: "#facc15", group: "discipline" },
    { id: "yellow-card", label: "Yellow card", color: "#eab308", group: "discipline" },
    { id: "red-card", label: "Red card", color: "#dc2626", group: "discipline" },
    { id: "ours", label: "Ours", color: "#2563eb", group: "team" },
    { id: "rivals", label: "Rivals", color: "#e11d48", group: "team" },
  ],
};
