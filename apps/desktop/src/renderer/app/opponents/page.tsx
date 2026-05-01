import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
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
import { AppShell } from "@/_components/app-shell";
import { useSettingsStore } from "@/_stores/settings.store";
import { useOpponentsStore } from "@/_stores/opponents.store";

export function OpponentsPage() {
  const { settings } = useSettingsStore();
  const { opponents, load, create } = useOpponentsStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (settings.platformFolder) void load(settings.platformFolder);
  }, [settings.platformFolder, load]);

  if (!settings.platformFolder) return null;

  return (
    <AppShell
      crumbs={[{ label: "Opponents" }]}
      rightSlot={
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> New opponent
        </Button>
      }
    >
      <div className="grid w-full grid-cols-1 gap-4 overflow-auto p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {opponents.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No opponents yet</CardTitle>
              <CardDescription>
                Create your first opponent to start importing matches and tagging clips.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" /> New opponent
              </Button>
            </CardContent>
          </Card>
        )}
        {opponents.map((opponent) => (
          <Link key={opponent.id} to={`/opponents/${opponent.slug}`} className="block">
            <Card className="h-full transition-colors hover:border-ring hover:bg-accent/40">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span
                  className="size-8 rounded-md"
                  style={{ backgroundColor: opponent.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate">{opponent.name}</CardTitle>
                  <CardDescription className="truncate">{opponent.slug}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <CreateOpponentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={async (input) => {
          try {
            await create(settings.platformFolder!, input);
            toast.success(`Created ${input.name}`);
            setDialogOpen(false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create opponent");
          }
        }}
      />
    </AppShell>
  );
}

function CreateOpponentDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { name: string; color: string; notes: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New opponent</DialogTitle>
          <DialogDescription>Add a rival team you want to analyze.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="opp-name">Name</Label>
            <Input id="opp-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <Label htmlFor="opp-color">Color</Label>
            <Input
              id="opp-color"
              type="color"
              className="h-9 w-16 p-1"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="opp-notes">Notes</Label>
            <Input id="opp-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => onCreate({ name: name.trim(), color, notes: notes.trim() })}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
