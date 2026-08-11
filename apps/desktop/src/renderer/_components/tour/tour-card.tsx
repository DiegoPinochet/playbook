import type { TooltipRenderProps } from "react-joyride";
import { Button } from "@playbook/ui";
import type { TourStepDef } from "./tour-steps";

export function TourCard({
  index,
  size,
  step,
  isLastStep,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const { awaits, nudge } = (step as TourStepDef).data;

  return (
    <div
      {...tooltipProps}
      className="w-[22rem] rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Step {index + 1} of {size}
      </div>
      {step.title && <h3 className="mt-1 text-sm font-semibold">{step.title}</h3>}
      <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.content}</div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button size="sm" variant="ghost" className="text-muted-foreground" {...skipProps}>
          Skip tour
        </Button>
        {awaits ? (
          <span className="animate-pulse text-right text-[11px] font-medium text-primary">
            {nudge}
          </span>
        ) : (
          <Button size="sm" {...primaryProps}>
            {isLastStep ? "Finish" : "Next"}
          </Button>
        )}
      </div>
    </div>
  );
}
