import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Download,
  ListPlus,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Trash2,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Separator,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@playbook/ui";
import type { ClipEntity, MatchEntity, OpponentEntity, TagEntity } from "@playbook/business-logic";
import { AppShell } from "@/_components/app-shell";
import { Timeline, formatTime } from "@/_components/timeline";
import { ClipCreateDialog } from "@/_components/clip-create-dialog";
import { useSettingsStore } from "@/_stores/settings.store";
import { useOpponentsStore } from "@/_stores/opponents.store";
import { useClipsStore } from "@/_stores/clips.store";

export function MatchEditorPage() {
  const { opponentSlug, matchSlug } = useParams<{
    opponentSlug: string;
    matchSlug: string;
  }>();
  const { settings } = useSettingsStore();
  const { opponents, load: loadOpponents } = useOpponentsStore();
  const { clips, tags, load: loadClips, create: createClip, remove: removeClip, createCustomTag } =
    useClipsStore();

  const [match, setMatch] = useState<MatchEntity | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inSec, setInSec] = useState<number | null>(null);
  const [outSec, setOutSec] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const opponent: OpponentEntity | undefined = opponents.find((o) => o.slug === opponentSlug);
  const platform = settings.platformFolder;
  const ctx = useMemo(
    () =>
      platform && opponentSlug && matchSlug
        ? { platform, opponentSlug, matchSlug }
        : null,
    [platform, opponentSlug, matchSlug]
  );

  useEffect(() => {
    if (platform && opponents.length === 0) void loadOpponents(platform);
  }, [platform, opponents.length, loadOpponents]);

  useEffect(() => {
    if (!ctx) return;
    void loadClips(ctx);
    void window.api.matches.list(ctx.platform, ctx.opponentSlug).then((all) => {
      const found = all.find((m) => m.slug === ctx.matchSlug);
      setMatch((found as MatchEntity | undefined) ?? null);
    });
  }, [ctx, loadClips]);

  const videoSrc = useMemo(() => {
    if (!ctx || !match) return "";
    const absolute = `${ctx.platform}/${ctx.opponentSlug}/${ctx.matchSlug}/${match.videoFileName}`;
    return `playbook-media://local${encodeURI(absolute)}`;
  }, [ctx, match]);

  const liveStateRef = useRef({ currentSec, inSec, outSec });
  liveStateRef.current = { currentSec, inSec, outSec };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (target as HTMLElement)?.isContentEditable) {
        return;
      }
      const live = liveStateRef.current;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyI") {
        e.preventDefault();
        setInSec(live.currentSec);
      } else if (e.code === "KeyO") {
        e.preventDefault();
        setOutSec(live.currentSec);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekBy(e.shiftKey ? -5 : -1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekBy(e.shiftKey ? 5 : 1);
      } else if (
        e.code === "Enter" &&
        live.inSec !== null &&
        live.outSec !== null &&
        live.outSec > live.inSec
      ) {
        e.preventDefault();
        setDialogOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  function seekBy(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  }

  function seekTo(sec: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = sec;
  }

  const filtered = clips.filter((c) => {
    if (filterTagIds.length && !filterTagIds.every((t) => c.tagIds.includes(t))) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!`${c.title} ${c.description}`.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  if (!ctx || !platform) return null;

  return (
    <AppShell
      crumbs={[
        { label: "Opponents", to: "/opponents" },
        { label: opponent?.name ?? opponentSlug ?? "", to: `/opponents/${opponentSlug}` },
        { label: match?.title ?? "Match" },
      ]}
      rightSlot={
        <>
          <Link
            to={`/opponents/${opponentSlug}/matches/${matchSlug}/players`}
            className="inline-flex"
          >
            <Button size="sm" variant="outline">
              <Users className="size-4" /> Player report
            </Button>
          </Link>
          {filtered.length > 0 && match && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const out = await window.api.video.exportPlaylist({
                  platform,
                  opponentSlug: ctx.opponentSlug,
                  matchSlug: ctx.matchSlug,
                  videoFileName: match.videoFileName,
                  segments: filtered.map((c) => ({ startSec: c.startSec, endSec: c.endSec })),
                });
                if (out) toast.success(`Exported to ${out}`);
              }}
            >
              <Download className="size-4" /> Export playlist
            </Button>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-sidebar p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tools
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            <ToolKey k="V">Select</ToolKey>
            <ToolKey k="I">Mark in</ToolKey>
            <ToolKey k="O">Mark out</ToolKey>
            <ToolKey k="␣">Play/pause</ToolKey>
            <ToolKey k="←">−1s</ToolKey>
            <ToolKey k="→">+1s</ToolKey>
            <ToolKey k="↵">Save clip</ToolKey>
          </div>
          <Separator className="my-3" />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </div>
          <div className="mt-2 flex flex-col gap-1 overflow-auto">
            {tags.map((t) => {
              const count = clips.filter((c) => c.tagIds.includes(t.id)).length;
              const active = filterTagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setFilterTagIds((prev) =>
                      prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                    )
                  }
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-accent data-[active=true]:bg-accent"
                  data-active={active}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="flex-1 truncate">{t.label}</span>
                  <span className="text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border bg-card/40 px-4 py-2 text-xs">
            <span className="flex items-center gap-1">
              <span
                className={`size-2 rounded-full ${inSec !== null && outSec !== null ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
              />
              REC
            </span>
            <span className="font-mono">
              {inSec !== null ? formatTime(inSec) : "--:--"} →{" "}
              {outSec !== null ? formatTime(outSec) : "--:--"}
              {inSec !== null && outSec !== null && outSec > inSec && (
                <span className="text-muted-foreground"> ({formatTime(outSec - inSec)})</span>
              )}
            </span>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                className="max-h-full max-w-full"
                onLoadedMetadata={(e) => setDurationSec((e.currentTarget.duration) || 0)}
                onTimeUpdate={(e) => setCurrentSec(e.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-card/40 px-3 py-2">
            <Button size="icon-sm" variant="ghost" onClick={() => seekBy(-5)}>
              <SkipBack className="size-4" />
            </Button>
            <Button size="icon" variant="default" onClick={togglePlay}>
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => seekBy(5)}>
              <SkipForward className="size-4" />
            </Button>
            <span className="ml-2 font-mono text-xs">
              {formatTime(currentSec)} / {formatTime(durationSec)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => setInSec(currentSec)}>
                    Mark in (I)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set start of new clip</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => setOutSec(currentSec)}>
                    Mark out (O)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set end of new clip</TooltipContent>
              </Tooltip>
              <Button
                size="sm"
                disabled={inSec === null || outSec === null || outSec <= inSec}
                onClick={() => setDialogOpen(true)}
              >
                <ListPlus className="size-4" /> + Clip
              </Button>
            </div>
          </div>
          <Timeline
            durationSec={durationSec}
            currentSec={currentSec}
            clips={clips}
            tags={tags}
            onSeek={seekTo}
            onSelectClip={(c) => {
              setSelectedClipId(c.id);
              seekTo(c.startSec);
            }}
            selectedClipId={selectedClipId}
          />
        </section>

        <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-sidebar">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Clips · {filtered.length}
            </span>
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7"
            />
          </div>
          <div className="flex-1 overflow-auto p-2">
            {filtered.length === 0 && (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                No clips yet. Press <kbd className="rounded bg-muted px-1">I</kbd> /{" "}
                <kbd className="rounded bg-muted px-1">O</kbd> to mark in/out, then{" "}
                <kbd className="rounded bg-muted px-1">Enter</kbd>.
              </div>
            )}
            <div className="flex flex-col gap-2">
              {filtered.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  tags={tags}
                  selected={selectedClipId === clip.id}
                  onClick={() => {
                    setSelectedClipId(clip.id);
                    seekTo(clip.startSec);
                  }}
                  onDelete={async () => {
                    await removeClip(ctx, clip.id);
                    toast.success("Clip deleted");
                  }}
                  onExport={async () => {
                    if (!match) return;
                    const out = await window.api.video.exportClip({
                      platform,
                      opponentSlug: ctx.opponentSlug,
                      matchSlug: ctx.matchSlug,
                      videoFileName: match.videoFileName,
                      startSec: clip.startSec,
                      endSec: clip.endSec,
                    });
                    if (out) toast.success(`Exported to ${out}`);
                  }}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <ClipCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        startSec={inSec}
        endSec={outSec}
        tags={tags}
        onSubmit={async (input) => {
          await createClip(ctx, {
            ...input,
            matchId: match?.id ?? "",
          });
          toast.success("Clip saved");
          setDialogOpen(false);
          setInSec(null);
          setOutSec(null);
        }}
        onCreateCustomTag={async (label) => {
          await createCustomTag(ctx, label);
        }}
      />
    </AppShell>
  );
}

function ToolKey({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1">
      <kbd className="font-mono text-[10px]">{k}</kbd>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

function ClipCard({
  clip,
  tags,
  selected,
  onClick,
  onDelete,
  onExport,
}: {
  clip: ClipEntity;
  tags: TagEntity[];
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      data-selected={selected}
      className="cursor-pointer transition-colors data-[selected=true]:border-ring data-[selected=true]:bg-accent/30"
    >
      <div className="flex items-start gap-2 p-2.5">
        <div className="font-mono text-[11px] text-muted-foreground">{formatTime(clip.startSec)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium leading-tight">{clip.title}</div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {formatTime(clip.endSec - clip.startSec)}
            </div>
          </div>
          {clip.description && (
            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{clip.description}</div>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {clip.tagIds.map((id) => {
              const tag = tags.find((t) => t.id === id);
              return tag ? (
                <Badge key={id} variant="outline" className="gap-1 text-[10px]">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.label}
                </Badge>
              ) : null;
            })}
            {clip.playerNumbers.map((n) => (
              <Badge key={`p${n}`} variant="secondary" className="text-[10px]">
                #{n}
              </Badge>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
            >
              <Download className="size-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
