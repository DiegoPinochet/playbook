# Theme tokens

Defined in `packages/ui/src/styles.css`. Tailwind 4 with `@theme inline` mapping them to utility classes.

## Semantic tokens (use these in components)

| Class | Purpose |
|---|---|
| `bg-background` `text-foreground` | Default surface + text |
| `bg-card` `text-card-foreground` | Cards, panels |
| `bg-popover` `text-popover-foreground` | Popovers, dialogs, tooltips |
| `bg-primary` `text-primary-foreground` | Primary CTA |
| `bg-secondary` `text-secondary-foreground` | Less important buttons |
| `bg-muted` `text-muted-foreground` | Subdued / hint text |
| `bg-accent` `text-accent-foreground` | Hover surfaces |
| `bg-destructive text-white` | Destructive actions |
| `border-border` | Default border |
| `bg-sidebar` `text-sidebar-foreground` | Side panels (left + right rails) |

## Tag colors

Each tag has its own CSS variable:

```
--tag-lineout   --tag-scrum     --tag-breakdown   --tag-attack
--tag-defence   --tag-kicking   --tag-set-piece   --tag-turnover
--tag-try       --tag-missed-tackle  --tag-linebreak  --tag-ours  --tag-rivals
```

For default tags, prefer the CSS variable (`backgroundColor: 'var(--tag-attack)'`). For all tags (including custom ones), the entity carries a `color: string` field — pass that directly: `style={{ backgroundColor: tag.color }}`.

## Dark vs light

The mockup is dark. The renderer's `<html>` has `class="dark"` by default. To support a light/system toggle later, read `settings.theme` in `app.tsx` and set the `dark` class accordingly.

## Don'ts

- Don't put raw oklch/hex into components. Add a token if a new color is recurring.
- Don't reach into `--card`, `--background` etc. in components — use the Tailwind `bg-*` utilities.
