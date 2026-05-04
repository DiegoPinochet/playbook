export const TAG_COLOR_PALETTE = [
  "#94a3b8",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#f97316",
  "#10b981",
  "#16a34a",
  "#fb7185",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
] as const;

export type TagColor = (typeof TAG_COLOR_PALETTE)[number];

export const DEFAULT_TAG_COLOR: TagColor = "#94a3b8";

export function isPaletteColor(color: string): color is TagColor {
  return (TAG_COLOR_PALETTE as ReadonlyArray<string>).includes(color);
}
