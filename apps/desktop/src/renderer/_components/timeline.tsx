import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@playbook/ui";
import type { ClipEntity, TagEntity } from "@playbook/business-logic";

export function Timeline({
  durationSec,
  currentSec,
  clips,
  tags,
  onSeek,
  onSelectClip,
  selectedClipId,
}: {
  durationSec: number;
  currentSec: number;
  clips: ClipEntity[];
  tags: TagEntity[];
  onSeek: (sec: number) => void;
  onSelectClip: (clip: ClipEntity) => void;
  selectedClipId: string | null;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const tagColor = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t.color])),
    [tags]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setTrackWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setTrackWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function pctFromSec(sec: number) {
    if (durationSec <= 0) return 0;
    return Math.max(0, Math.min(100, (sec / durationSec) * 100));
  }

  function seekFromClientX(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || durationSec <= 0) return;
    const x = clientX - rect.left;
    const sec = (x / rect.width) * durationSec;
    onSeek(Math.max(0, Math.min(durationSec, sec)));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    seekFromClientX(e.clientX);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  const ticks = useMemo(() => {
    if (durationSec <= 0 || trackWidth <= 0) return [];
    const TARGET_PX = 90;
    const targetCount = Math.max(2, Math.floor(trackWidth / TARGET_PX));
    const rawStep = durationSec / targetCount;
    const niceSteps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    const step = niceSteps.find((s) => s >= rawStep) ?? 3600;
    const out: { sec: number; label: string }[] = [];
    for (let s = 0; s <= durationSec; s += step) {
      out.push({ sec: s, label: formatTime(s) });
    }
    return out;
  }, [durationSec, trackWidth]);

  return (
    <div className="border-t border-border bg-sidebar/50">
      <div className="relative ml-20 h-6 select-none border-b border-border font-mono text-[10px] tabular-nums text-muted-foreground">
        {ticks.map((t, i) => {
          const pct = pctFromSec(t.sec);
          const isFirst = i === 0;
          const isLast = i === ticks.length - 1;
          return (
            <div
              key={t.sec}
              className="absolute top-0 flex h-full flex-col items-center"
              style={{
                left: `${pct}%`,
                transform: isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              <span className="px-1 leading-4 whitespace-nowrap">{t.label}</span>
              <span className="h-2 w-px bg-border" aria-hidden />
            </div>
          );
        })}
      </div>

      <Track label="VIDEO">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative h-7 w-full cursor-ew-resize touch-none bg-muted/40"
        >
          <div
            className="pointer-events-none absolute top-0 h-full w-0.5 bg-primary"
            style={{ left: `${pctFromSec(currentSec)}%` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow"
            style={{ left: `${pctFromSec(currentSec)}%` }}
            aria-hidden
          />
        </div>
      </Track>

      <Track label="CLIPS">
        <div className="relative h-9 w-full bg-muted/20">
          {clips.map((clip) => {
            const left = pctFromSec(clip.startSec);
            const width = pctFromSec(clip.endSec) - left;
            const primaryTag = clip.tagIds[0];
            const color = (primaryTag && tagColor[primaryTag]) || "#94a3b8";
            return (
              <Tooltip key={clip.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectClip(clip)}
                    className={cn(
                      "absolute top-1 bottom-1 flex cursor-pointer items-center gap-1 overflow-hidden rounded-sm border border-black/30 px-1 text-left text-[10px] font-medium text-white shadow-sm transition-transform hover:translate-y-[-1px]",
                      selectedClipId === clip.id && "ring-2 ring-ring ring-offset-1 ring-offset-sidebar",
                      clip.starred && "ring-1 ring-amber-300"
                    )}
                    style={{
                      left: `${left}%`,
                      width: `max(8px, ${width}%)`,
                      backgroundColor: color,
                    }}
                  >
                    {clip.starred && (
                      <Star className="size-2.5 shrink-0 fill-amber-300 text-amber-300" />
                    )}
                    <span className="block truncate">{clip.title}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs">
                    <div className="font-semibold">{clip.title}</div>
                    {clip.description && <div>{clip.description}</div>}
                    <div className="text-muted-foreground">
                      {formatTime(clip.startSec)} → {formatTime(clip.endSec)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          <div
            className="pointer-events-none absolute top-0 h-full w-px bg-primary"
            style={{ left: `${pctFromSec(currentSec)}%` }}
            aria-hidden
          />
        </div>
      </Track>
    </div>
  );
}

function Track({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-stretch border-b border-border">
      <div className="flex w-20 shrink-0 items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
