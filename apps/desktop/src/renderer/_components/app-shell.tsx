import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger } from "@playbook/ui";
import { useNotesStore } from "@/_stores/notes.store";
import { NotesPanel } from "./notes-panel";
import appIconUrl from "@/assets/app-icon.png";

type Crumb = { label: string; to?: string };

export function AppShell({
  crumbs,
  rightSlot,
  children,
}: {
  crumbs: Crumb[];
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  const { open: notesOpen, toggle: toggleNotes } = useNotesStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyJ") {
        e.preventDefault();
        toggleNotes();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleNotes]);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header
        className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-sidebar pr-4 [-webkit-app-region:drag]"
        style={{ paddingLeft: "calc(78px + 0.75rem)" }}
      >
        <Link
          to="/opponents"
          className="flex size-7 shrink-0 overflow-hidden rounded-md [-webkit-app-region:no-drag]"
          aria-label="Playbook home"
        >
          <img src={appIconUrl} alt="" className="size-full object-cover" />
        </Link>
        <span className="text-sm font-semibold">Playbook</span>
        <span className="text-muted-foreground">·</span>
        <nav className="flex items-center gap-2 text-sm [-webkit-app-region:no-drag]">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.to ? (
                <Link to={c.to} className="text-muted-foreground hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className={cn(i === crumbs.length - 1 && "text-foreground")}>{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="text-muted-foreground">›</span>}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 [-webkit-app-region:no-drag]">
          {rightSlot}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant={notesOpen ? "secondary" : "ghost"}
                onClick={toggleNotes}
                aria-label="Toggle notes"
                aria-pressed={notesOpen}
              >
                <NotebookPen className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notes (⌘J)</TooltipContent>
          </Tooltip>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1">{children}</main>
        {notesOpen && <NotesPanel />}
      </div>
    </div>
  );
}
