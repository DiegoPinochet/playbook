# Layouts

## AppShell

Top-level chrome for every page. Provides:

- 48px header with logo, breadcrumb, right-slot for actions.
- A `<main>` flex container that fills remaining space.

Usage:

```tsx
<AppShell
  crumbs={[{ label: "Opponents", to: "/opponents" }, { label: opponent.name }]}
  rightSlot={<Button>...</Button>}
>
  {/* page content */}
</AppShell>
```

## Match editor (the heart)

Three-column layout under the header:

```
┌──────────────┬─────────────────────────────────┬───────────────────┐
│ TOOLS / TAGS │ REC strip                       │ CLIPS · n  + filt│
│ left rail    │ video                           │ clip cards       │
│ (~176px)     │ transport bar                   │ (~320px)         │
│              │ multi-track timeline            │                  │
└──────────────┴─────────────────────────────────┴───────────────────┘
```

- Left rail: `<aside class="w-44 shrink-0 ... bg-sidebar">`.
- Right rail: `<aside class="w-80 shrink-0 ... bg-sidebar">`.
- Center column: `flex-1 flex flex-col`. Video container is `flex-1 bg-black` so the video stays centered with letterboxing.

## Lists / grids

- Opponents list: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6`.
- Matches list: `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 p-6`.

## Empty states

Always render an empty Card with a CardTitle, CardDescription, and a CTA Button. Don't just leave the page blank.
