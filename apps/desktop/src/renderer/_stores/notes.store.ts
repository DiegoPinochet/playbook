import { create } from "zustand";

const OPEN_KEY = "playbook.notes-open";
const WIDTH_KEY = "playbook.notes-sidebar-width";

const MIN_WIDTH = 240;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 320;

function readBool(key: string, fallback: boolean): boolean {
  const raw = window.localStorage.getItem(key);
  return raw === null ? fallback : raw === "true";
}

function readWidth(): number {
  const stored = Number(window.localStorage.getItem(WIDTH_KEY));
  if (Number.isFinite(stored) && stored >= MIN_WIDTH && stored <= MAX_WIDTH) return stored;
  return DEFAULT_WIDTH;
}

type NotesStore = {
  open: boolean;
  width: number;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setWidth: (width: number) => void;
};

export const NOTES_MIN_WIDTH = MIN_WIDTH;
export const NOTES_MAX_WIDTH = MAX_WIDTH;

export const useNotesStore = create<NotesStore>((set, get) => ({
  open: readBool(OPEN_KEY, false),
  width: readWidth(),
  toggle: () => {
    const next = !get().open;
    window.localStorage.setItem(OPEN_KEY, String(next));
    set({ open: next });
  },
  setOpen: (open) => {
    window.localStorage.setItem(OPEN_KEY, String(open));
    set({ open });
  },
  setWidth: (width) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
    window.localStorage.setItem(WIDTH_KEY, String(clamped));
    set({ width: clamped });
  },
}));
