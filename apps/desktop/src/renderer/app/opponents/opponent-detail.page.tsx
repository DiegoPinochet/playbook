import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@playbook/ui";
import type { OpponentEntity } from "@playbook/business-logic";
import { AppShell } from "@/_components/app-shell";
import { useSettingsStore } from "@/_stores/settings.store";
import { useOpponentsStore } from "@/_stores/opponents.store";
import { useMatchesStore } from "@/_stores/matches.store";

export function OpponentDetailPage() {
  const { opponentSlug } = useParams<{ opponentSlug: string }>();
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { opponents, load: loadOpponents } = useOpponentsStore();
  const { matches, load: loadMatches } = useMatchesStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const opponent: OpponentEntity | undefined = opponents.find((o) => o.slug === opponentSlug);

  useEffect(() => {
    if (settings.platformFolder && opponents.length === 0) {
      void loadOpponents(settings.platformFolder);
    }
  }, [settings.platformFolder, opponents.length, loadOpponents]);

  useEffect(() => {
    if (settings.platformFolder && opponentSlug) {
      void loadMatches(settings.platformFolder, opponentSlug);
    }
  }, [settings.platformFolder, opponentSlug, loadMatches]);

  if (!settings.platformFolder || !opponentSlug) return null;

  return (
    <AppShell
      crumbs={[
        { label: "Opponents", to: "/opponents" },
        { label: opponent?.name ?? opponentSlug },
      ]}
      rightSlot={
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Upload className="size-4" /> Import match
        </Button>
      }
    >
      <div className="grid w-full auto-rows-min content-start grid-cols-1 gap-3 overflow-auto p-6 lg:grid-cols-2 xl:grid-cols-3">
        {matches.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No matches yet</CardTitle>
              <CardDescription>Import a video file to start analyzing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" /> Import match
              </Button>
            </CardContent>
          </Card>
        )}
        {matches.map((match) => (
          <Link
            key={match.id}
            to={`/opponents/${opponentSlug}/matches/${match.slug}`}
            className="block"
          >
            <Card className="transition-colors hover:border-ring hover:bg-accent/40">
              <CardHeader>
                <CardTitle className="truncate">{match.title}</CardTitle>
                <CardDescription>
                  {match.date ?? "no date"} · {match.venue ?? "—"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {opponent && (
        <ImportMatchDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          opponent={opponent}
          platformFolder={settings.platformFolder}
          onCreated={(slug) => {
            setDialogOpen(false);
            navigate(`/opponents/${opponentSlug}/matches/${slug}`);
          }}
        />
      )}
    </AppShell>
  );
}

function ImportMatchDialog({
  open,
  onOpenChange,
  opponent,
  platformFolder,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opponent: OpponentEntity;
  platformFolder: string;
  onCreated: (matchSlug: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>("");
  const [venue, setVenue] = useState("");
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickVideo() {
    const path = await window.api.matches.pickVideoFile();
    if (path) setVideoPath(path);
  }

  async function submit() {
    if (!videoPath || !title.trim()) return;
    setBusy(true);
    try {
      const match = await window.api.matches.create({
        platform: platformFolder,
        opponentSlug: opponent.slug,
        opponentId: opponent.id,
        title: title.trim(),
        date: date || null,
        venue: venue.trim() || null,
        sourceVideoPath: videoPath,
      });
      toast.success(`Imported ${match.title}`);
      onCreated(match.slug);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import match</DialogTitle>
          <DialogDescription>
            The video will be copied into <code className="text-xs">{opponent.slug}/&lt;match&gt;/</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="m-title">Title</Label>
            <Input
              id="m-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="R12 — vs France"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-date">Date</Label>
              <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="m-venue">Venue</Label>
              <Input id="m-venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Video file</Label>
            <div className="mt-1 flex items-center gap-2">
              <Button variant="outline" onClick={pickVideo}>
                {videoPath ? "Change…" : "Choose file…"}
              </Button>
              <span className="truncate text-xs text-muted-foreground">{videoPath ?? "no file"}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button disabled={!videoPath || !title.trim() || busy} onClick={submit}>
            {busy ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
