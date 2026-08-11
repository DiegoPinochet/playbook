import { create } from "zustand";
import { TOUR_STEPS, type TourSignal } from "@/_components/tour/tour-steps";
import { useSettingsStore } from "./settings.store";

/** Let the app's own state settle (dialog mount, panel open) before joyride measures the next target. */
const ADVANCE_DELAY_MS = 250;

type TourStore = {
  running: boolean;
  stepIndex: number;
  /** Begins at step 0. No-op if already running. */
  start: () => void;
  /** The single door every step change goes through. */
  setStepIndex: (index: number) => void;
  /** Ends the tour and stops it from auto-starting again. */
  finish: () => void;
  /** Advances only if the current step is waiting on this exact signal. */
  signal: (event: TourSignal) => void;
};

export const useTourStore = create<TourStore>((set, get) => ({
  running: false,
  stepIndex: 0,
  start: () => {
    if (get().running) return;
    set({ running: true, stepIndex: 0 });
  },
  setStepIndex: (index) => {
    const next = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
    set({ stepIndex: next });

    // A gate the user satisfied before arriving here would never fire its signal again,
    // stranding the tour. Re-check it on arrival and let the normal path advance.
    const { awaits, satisfiedIf } = TOUR_STEPS[next]?.data ?? {};
    if (awaits && satisfiedIf?.()) get().signal(awaits);
  },
  finish: () => {
    if (!get().running) return;
    set({ running: false, stepIndex: 0 });
    void useSettingsStore.getState().setTourEnabled(false);
  },
  signal: (event) => {
    const { running, stepIndex } = get();
    if (!running) return;
    if (TOUR_STEPS[stepIndex]?.data.awaits !== event) return;
    setTimeout(() => {
      const current = get();
      // Guard against a double signal (keyboard + click) skipping two steps.
      if (current.running && current.stepIndex === stepIndex) {
        current.setStepIndex(stepIndex + 1);
      }
    }, ADVANCE_DELAY_MS);
  },
}));
