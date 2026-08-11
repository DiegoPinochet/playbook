import type { SportPreset } from "./index";

export const RUGBY_PRESET: SportPreset = {
  sport: "rugby",
  tags: [
    { id: "lineout", label: "Lineout", color: "#3b82f6", group: "set-piece" },
    { id: "scrum", label: "Scrum", color: "#eab308", group: "set-piece" },
    { id: "set-piece", label: "Set-piece", color: "#60a5fa", group: "set-piece" },
    { id: "breakdown", label: "Breakdown", color: "#22c55e", group: "phase" },
    { id: "attack", label: "Attack", color: "#ef4444", group: "phase" },
    { id: "defence", label: "Defence", color: "#f97316", group: "phase" },
    { id: "kicking", label: "Kicking", color: "#facc15", group: "phase" },
    { id: "try", label: "Try", color: "#16a34a", group: "outcome" },
    { id: "turnover", label: "Turnover", color: "#10b981", group: "outcome" },
    { id: "linebreak", label: "Linebreak", color: "#fb7185", group: "outcome" },
    { id: "missed-tackle", label: "Missed tackle", color: "#dc2626", group: "outcome" },
    { id: "ours", label: "Ours", color: "#2563eb", group: "team" },
    { id: "rivals", label: "Rivals", color: "#e11d48", group: "team" },
  ],
};
