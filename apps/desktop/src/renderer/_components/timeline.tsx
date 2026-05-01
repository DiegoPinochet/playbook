import { useMemo, useRef } from "react";
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
  const tagColor = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t.color])),
    [tags]
  );

  function pctFromSec(sec: number) {
    if (durationSec <= 0) return 0;
    return Math.max(0, Math.min(100, (sec / durationSec) * 100));
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!trackRef.current || durationSec <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const sec = (x / rect.width) * durationSec;
    onSeek(Math.max(0, Math.min(durationSec, sec)));
  }

  const ticks = useMemo(() => {
    const out: { sec: number; label: string }[] = [];
    const step = durationSec >= 600 ? 300 : durationSec >= 120 ? 60 : 10;
    for (let s = 0; s <= durationSec; s += step) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      out.push({ sec: s, label: `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` });
    }
    return out;
  }, [durationSec]);

  return (
    <div className="border-t border-border bg-sidebar/50">
      <div className="relative h-5 select-none border-b border-border text-[10px] text-muted-foreground">
        {ticks.map((t) => (
          <div
            key={t.sec}
            className="absolute top-0 -translate-x-1/2 px-1 leading-5"
            style={{ left: `${pctFromSec(t.sec)}%` }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <Track label="VIDEO">
        <div
          ref={trackRef}
          onClick={handleClick}
          className="relative h-7 w-full cursor-pointer bg-muted/40"
        >
          <div
            className="absolute top-0 h-full w-px bg-primary"
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
                      "absolute top-1 bottom-1 cursor-pointer rounded-sm border border-black/30 px-1 text-left text-[10px] font-medium text-white shadow-sm transition-transform hover:translate-y-[-1px]",
                      selectedClipId === clip.id && "ring-2 ring-ring ring-offset-1 ring-offset-sidebar"
                    )}
                    style={{
                      left: `${left}%`,
                      width: `max(8px, ${width}%)`,
                      backgroundColor: color,
                    }}
                  >
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
