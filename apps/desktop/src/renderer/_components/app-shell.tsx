import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@playbook/ui";

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
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-sidebar px-4">
        <Link
          to="/opponents"
          className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold"
        >
          P
        </Link>
        <span className="text-sm font-semibold">Playbook</span>
        <span className="text-muted-foreground">·</span>
        <nav className="flex items-center gap-2 text-sm">
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
        <div className="ml-auto flex items-center gap-2">{rightSlot}</div>
      </header>
      <main className="flex min-h-0 flex-1">{children}</main>
    </div>
  );
}
