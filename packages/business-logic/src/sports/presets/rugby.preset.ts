import type { SportPreset } from "./index";

export const RUGBY_PRESET: SportPreset = {
  sport: "rugby",
  tags: [
    { id: "lineout", label: "Lineout", color: "#3b82f6" },
    { id: "scrum", label: "Scrum", color: "#eab308" },
    { id: "breakdown", label: "Breakdown", color: "#22c55e" },
    { id: "attack", label: "Attack", color: "#ef4444" },
    { id: "defence", label: "Defence", color: "#f97316" },
    { id: "kicking", label: "Kicking", color: "#facc15" },
    { id: "set-piece", label: "Set-piece", color: "#60a5fa" },
    { id: "turnover", label: "Turnover", color: "#10b981" },
    { id: "try", label: "Try", color: "#16a34a" },
    { id: "missed-tackle", label: "Missed tackle", color: "#dc2626" },
    { id: "linebreak", label: "Linebreak", color: "#fb7185" },
    { id: "ours", label: "Ours", color: "#2563eb" },
    { id: "rivals", label: "Rivals", color: "#e11d48" },
  ],
};
