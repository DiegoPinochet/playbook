# Components

Source: `packages/ui/src/components/`. Re-exported from `@playbook/ui`.

| Component | Notes |
|---|---|
| `Button` | Variants: default, destructive, outline, secondary, ghost, link. Sizes: default, sm, lg, icon, icon-sm, icon-lg. `asChild` for Slot. |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Standard shadcn card. |
| `Input`, `Textarea` | Forwards ref. |
| `Label` | Radix label. |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | Standard shadcn dialog with an X close button baked in. |
| `Badge` | Variants: default, secondary, destructive, outline. |
| `Separator` | horizontal/vertical. |
| `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent` | Wrap the app in `<TooltipProvider>` once (already done in `app.tsx`). |
| `DropdownMenu*` | Full menu primitives. |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | |
| `Skeleton` | Loading placeholder. |
| `Slider` | Single-thumb (used for video volume etc.). |
| `Toaster`, `toast` | Sonner. Already mounted in `app.tsx`. |
| `cn` | tailwind-merge + clsx helper. |

## Adding a component

1. New file: `packages/ui/src/components/<name>.tsx`.
2. Export from `packages/ui/src/index.ts`.
3. If it depends on a Radix primitive, add the dep to `packages/ui/package.json`.
4. If the component needs a CSS variable, add it to `packages/ui/src/styles.css`.

## Don'ts

- Don't import Radix primitives or `lucide-react` directly in the renderer if a wrapper exists in `@playbook/ui`. Wrap once, reuse everywhere.
- Don't add component-level state/effects to a UI primitive. The UI package is dumb-by-design.
