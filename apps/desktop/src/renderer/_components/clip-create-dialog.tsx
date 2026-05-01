import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  toast,
} from "@playbook/ui";
import type { TagEntity } from "@playbook/business-logic";
import { formatTime } from "./timeline";

export function ClipCreateDialog({
  open,
  onOpenChange,
  startSec,
  endSec,
  tags,
  onSubmit,
  onCreateCustomTag,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startSec: number | null;
  endSec: number | null;
  tags: TagEntity[];
  onSubmit: (input: {
    title: string;
    description: string;
    startSec: number;
    endSec: number;
    tagIds: string[];
    playerNumbers: number[];
  }) => Promise<void>;
  onCreateCustomTag: (label: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [playersRaw, setPlayersRaw] = useState("");
  const [newTagLabel, setNewTagLabel] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setTagIds([]);
      setPlayersRaw("");
      setNewTagLabel("");
    }
  }, [open]);

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleNewTag() {
    if (!newTagLabel.trim()) return;
    try {
      await onCreateCustomTag(newTagLabel.trim());
      setNewTagLabel("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create tag");
    }
  }

  async function submit() {
    if (startSec === null || endSec === null) return;
    const playerNumbers = playersRaw
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n > 0 && n < 100);
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      startSec,
      endSec,
      tagIds,
      playerNumbers,
    });
  }

  const valid = startSec !== null && endSec !== null && endSec > startSec && title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New clip</DialogTitle>
          <DialogDescription>
            {startSec !== null && endSec !== null
              ? `${formatTime(startSec)} → ${formatTime(endSec)} (${formatTime(endSec - startSec)})`
              : "Mark in/out points first."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="c-title">Title</Label>
            <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const active = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs transition-colors data-[active=true]:border-transparent data-[active=true]:text-white"
                    data-active={active}
                    style={active ? { backgroundColor: tag.color } : {}}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                      aria-hidden
                    />
                    {tag.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Add custom tag…"
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleNewTag();
                  }
                }}
              />
              <Button variant="outline" onClick={handleNewTag} disabled={!newTagLabel.trim()}>
                Add
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="c-players">Player numbers</Label>
            <Input
              id="c-players"
              placeholder="e.g. 7, 12"
              value={playersRaw}
              onChange={(e) => setPlayersRaw(e.target.value)}
            />
          </div>
          {tagIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tagIds.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <Badge key={id} variant="outline" className="gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                      aria-hidden
                    />
                    {tag.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={submit}>
            Save clip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
