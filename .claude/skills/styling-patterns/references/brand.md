# Brand mark

Playbook has one canonical icon — a purple gradient square with a white tactical play diagram (book opened with X's, O's, and an arrow). It ships in three forms:

| File | Purpose |
|---|---|
| `apps/desktop/build/icon.icns` | macOS app icon (Dock, packaged dmg, Finder). Consumed by `electron-builder`. |
| `apps/desktop/build/icon.png` | PNG source for the icns; also used as the dev-mode dock icon (`app.dock.setIcon` in `src/main/index.ts`). |
| `apps/desktop/src/renderer/assets/app-icon.png` | Renderer copy of the same image, imported as a Vite asset for in-app use. |
| `apps/desktop/src/renderer/assets/glyph.png` | White-only glyph (no background) for cases where you need to tint or place on a custom surface. |

## In-app usage

Import the renderer asset and render it at the size you want — it already has its own purple gradient background, so don't wrap it in another colored box.

```tsx
import appIconUrl from "@/assets/app-icon.png";

<Link
  to="/opponents"
  className="flex size-7 shrink-0 overflow-hidden rounded-md"
  aria-label="Playbook home"
>
  <img src={appIconUrl} alt="" className="size-full object-cover" />
</Link>
```

- Use `object-cover` (not `object-contain`) so the icon fills its container.
- Round the wrapper with `rounded-md` (or `rounded-lg` at larger sizes) — the source PNG isn't pre-rounded; we mask it.
- `alt=""` plus an `aria-label` on the parent — the icon is decorative inside an already-labeled link.

## Don'ts

- **Don't fall back to a literal "P"** or other ASCII placeholders. The icon is the brand.
- **Don't tint the full app-icon.png** — it has gradient + glyph baked in. If you need a tinted/single-color version, use `glyph.png` (white-on-transparent) and color the surface behind it.
- **Don't redraw the glyph in code** (SVG paths, lucide replacements, etc.). Always use the bundled asset so the dock icon, dmg icon, and in-app mark stay identical.
- **Don't move or rename `apps/desktop/build/icon.*`** — `electron-builder` packages from those paths automatically.

## Updating the icon

If the design changes:

1. Replace `apps/desktop/build/icon.png` (1024×1024 recommended) and regenerate the `icon.icns` (`iconutil` or any icns tool).
2. Re-copy into the renderer: `cp apps/desktop/build/icon.png apps/desktop/src/renderer/assets/app-icon.png`.
3. If you also have a white-glyph variant, drop it at `apps/desktop/src/renderer/assets/glyph.png`.
4. Bump the app version and `pnpm release` — the new icon ships in the next dmg.
