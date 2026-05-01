---
name: styling-patterns
description: Use when building or modifying UI, layouts, dialogs, the timeline, the clip card, or anything visual. Triggers on "build a form", "add a component", "style this page", "update the layout", "tweak the timeline".
---

Read in order:

- `references/theme.md` — semantic CSS tokens and tag colors
- `references/components.md` — what's in `@playbook/ui` and how to extend it
- `references/layouts.md` — `AppShell`, sidebars, the editor's three-column layout

## Quick rules

1. UI imports come from `@playbook/ui`. If a component is missing, **add it to `@playbook/ui`** — don't write a copy in the renderer.
2. Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`) instead of raw oklch/hex.
3. Tag colors come from CSS variables (`var(--tag-attack)`...) or directly from the entity's `color` field — never hardcode tag hex values in components.
4. Dark theme is the default (mockup is dark). Light theme is supported but not the priority.
5. Icons come from `lucide-react`. Use `size-4` (16px) by default, `size-3` for badges/dense rows.
6. Round corners: `rounded-md` for cards/buttons, `rounded-sm` for inline chips. Avoid `rounded-full` except for status dots and avatars.
