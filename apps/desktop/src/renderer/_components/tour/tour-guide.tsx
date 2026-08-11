import { Joyride, ACTIONS, EVENTS, STATUS, type EventData } from "react-joyride";
import { useTourStore } from "@/_stores/tour.store";
import { TOUR_STEPS } from "./tour-steps";
import { TourCard } from "./tour-card";

/** Above the Radix dialog overlay (z-50) so steps inside the clip dialog stay reachable. */
const TOUR_Z_INDEX = 10000;

export function TourGuide() {
  const running = useTourStore((s) => s.running);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const setStepIndex = useTourStore((s) => s.setStepIndex);
  const finish = useTourStore((s) => s.finish);

  function handleEvent({ action, index, status, type }: EventData) {
    if (
      type === EVENTS.TOUR_END ||
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.SKIP
    ) {
      finish();
      return;
    }
    if (type === EVENTS.TARGET_NOT_FOUND) {
      // A missing anchor must never strand the user mid-tour.
      setStepIndex(index + 1);
      return;
    }
    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.PREV) {
        setStepIndex(index - 1);
        return;
      }
      // In controlled mode Joyride never ends the tour on its own — it emits no tour:end and
      // waits on our stepIndex — so the last step's primary button is ours to act on.
      if (index >= TOUR_STEPS.length - 1) finish();
      else setStepIndex(index + 1);
    }
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={running}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      tooltipComponent={TourCard}
      onEvent={handleEvent}
      options={{
        zIndex: TOUR_Z_INDEX,
        overlayColor: "rgba(0, 0, 0, 0.65)",
        // Clicking the dark area is easy to do by accident mid-cut; only the buttons end the tour.
        overlayClickAction: false,
        // Escape belongs to the clip dialog, not to the tour.
        dismissKeyAction: false,
        // The whole point is that the user presses the highlighted control themselves.
        blockTargetInteraction: false,
        // Radix already manages focus inside the dialog; a second trap fights it.
        disableFocusTrap: true,
        // Guided flow — every step opens straight away instead of waiting on a beacon click.
        skipBeacon: true,
        spotlightPadding: 6,
      }}
    />
  );
}
