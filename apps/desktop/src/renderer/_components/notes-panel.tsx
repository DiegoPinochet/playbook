import { useEffect, useMemo, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
} from "@playbook/ui";
import type { OpponentEntity } from "@playbook/business-logic";
import { useSettingsStore } from "@/_stores/settings.store";
import { useOpponentsStore } from "@/_stores/opponents.store";
import {
  NOTES_MAX_WIDTH,
  NOTES_MIN_WIDTH,
  useNotesStore,
} from "@/_stores/notes.store";

export function NotesPanel() {
  const location = useLocation();
  const { settings } = useSettingsStore();
  const { opponents, load: loadOpponents, update: updateOpponent } = useOpponentsStore();
  const { width, setWidth } = useNotesStore();

  const opponentSlug = useMemo(() => {
    const m = matchPath("/opponents/:opponentSlug/*", location.pathname);
    return m?.params.opponentSlug ?? null;
  }, [location.pathname]);

  useEffect(() => {
    if (settings.platformFolder && opponents.length === 0) {
      void loadOpponents(settings.platformFolder);
    }
  }, [settings.platformFolder, opponents.length, loadOpponents]);

  const opponent = opponentSlug ? opponents.find((o) => o.slug === opponentSlug) ?? null : null;

  function startResize(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const next = Math.min(
        NOTES_MAX_WIDTH,
        Math.max(NOTES_MIN_WIDTH, startWidth + (startX - ev.clientX))
      );
      setWidth(next);
    }
    function onUp() {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    }
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l border-border bg-sidebar"
      style={{ width }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={startResize}
        className="absolute -left-0.5 top-0 z-10 h-full w-1 cursor-ew-resize touch-none bg-transparent transition-colors hover:bg-ring/40"
      />
      {opponent && settings.platformFolder ? (
        <NotesEditor
          opponent={opponent}
          onSave={async (notes) => {
            await updateOpponent(settings.platformFolder!, { id: opponent.id, notes });
          }}
        />
      ) : (
        <EmptyState />
      )}
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Notes
      </span>
      <p className="text-xs text-muted-foreground">
        Open an opponent or one of its matches to take notes about them.
      </p>
    </div>
  );
}

function NotesEditor({
  opponent,
  onSave,
}: {
  opponent: OpponentEntity;
  onSave: (notes: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(opponent.notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(opponent.notes);
  }, [opponent.id, opponent.notes]);

  const dirty = useMemo(() => draft !== opponent.notes, [draft, opponent.notes]);

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onSave(draft);
      toast.success("Notes saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save notes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: opponent.color }}
            aria-hidden
          />
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {opponent.name}
          </span>
        </div>
        <Button size="sm" variant="outline" disabled={!dirty || saving} onClick={save}>
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </Button>
      </header>
      <Tabs defaultValue="edit" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-2 self-start">
          <TabsTrigger value="edit">Markdown</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-0 flex min-h-0 flex-1 flex-col">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => void save()}
            placeholder={`Tendencies, key players, notes about ${opponent.name}…\n\nMarkdown supported: **bold**, *italic*, lists, [links](https://…), \`code\`.`}
            className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-0 min-h-0 flex-1 overflow-auto">
          {draft.trim() ? (
            <div className="px-4 py-3 text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {draft}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-muted-foreground">Nothing to preview yet.</div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-2 mt-3 text-base font-bold" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-1.5 mt-3 text-sm font-bold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-1 mt-2 text-sm font-semibold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-1.5 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-1.5 list-disc pl-5" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-1.5 list-decimal pl-5" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="my-0.5" {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-2 overflow-auto rounded bg-muted p-2 font-mono text-xs" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-2 border-l-2 border-border pl-3 italic text-muted-foreground"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-primary underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-3 border-border" {...props} />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <table className="my-2 w-full border-collapse text-xs" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="border-b border-border px-2 py-1 text-left font-semibold" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b border-border/40 px-2 py-1" {...props} />
  ),
};
