# Playbook — Product Context

Local-first desktop tool for rugby coaches/analysts to break down rival match footage into tagged clips, build playlists, generate per-player reports, and annotate paused frames.

## Source brief (audio, Spanish, verbatim)

> La app a la puerta del video sirve, en primer lugar, para poder dividir el partido por acciones (tackles, drops, scams ganados, scams perdidos, scams a favor, scams en contra, etc.). Todo partido por acciones, ¿cacháis? Es lo mismo que genera una línea de tiempo y esa línea de tiempo tú después podés ir armando como playlist para ir mostrando o ir buscando los cortes, por ejemplo, filtrar y agarrar todos los scams o filtrar y agarrar el, ¿qué pones tú? Y ganar posición, entonces, agarráis tres, cuatro secuencias de ataque y ahora tenéis el duro tres, cuatro secuencias de defensa que tenéis metidas arriba, etc. Voy como armando cortes para poder mostrar después y luego para la segunda función que sirve y también es más retroalcésico: cortar la cantidad de tackle. Entonces, tú cuando agarras designéis un jugador, un número de jugador, por ejemplo 7 tackle correcto, entonces le vais generando un informe de tres jugadores para ver cuántos tackle hizo, etc. Ese es el principal rol. El segundo rol es poder mostrar desde ahí en imagen un corte que pide ese pause y poder marcar, por ejemplo, donde hayan espacios marcar. Y con un put que te va al parado o con el codo que te va al put, etc.

(Note: "scams" in the transcript = "scrums". "ganar posición" = gaining ground/territory.)

## Three core jobs (extracted from the brief)

### 1 — Break the match into action clips (timeline)
Watch the full match, mark in/out points, tag each clip by action(s) and by which side performed it (`ours` / `rivals`). The accumulated clips form a timeline under the player and can be filtered to build playlists ("show me all our scrums", "show me 4 attacking sequences then 4 defensive sequences").

### 2 — Per-player tackle / action reports
Tag clips with the player number(s) involved (e.g., `#7 — tackle correct`). Roll those up into per-player reports: how many tackles, how many correct/missed, etc. Brief mentions reports across multiple players ("informe de tres jugadores").

### 3 — Pause-frame tactical annotation
Pause on a frame, draw spatial markers — arrows showing space/runs ("donde hayan espacios marcar… con un put que te va al parado o con el codo que te va al put"). The mockup field-view screenshot suggests overlaying player-position dots and movement arrows on a still frame.

## Tag taxonomy (locked from mockup, supersedes plan placeholder)

Tags are first-class, color-coded, filterable. Source: left rail of mockup.

| Tag | Color | Default count seen | Notes |
|---|---|---|---|
| `lineout` | blue | 8 | set-piece variant |
| `scrum` | yellow | 5 | set-piece variant |
| `breakdown` | green | 12 | rucks, mauls |
| `attack` | red | 14 | possession-based |
| `defence` | red-orange | 11 | possession-based |
| `kicking` | yellow | 6 | |
| `set-piece` | blue | 13 | overlaps lineout/scrum — usually combined |
| `turnover` | green | 4 | |
| `try` | green | 3 | |
| `missed-tackle` | red | 5 | |
| `linebreak` | red | 7 | |
| `ours` | blue | 22 | side qualifier — combine with action tag |
| `rivals` | red | 9 | side qualifier — combine with action tag |

Tags are **multi-assign** per clip (e.g., `lineout` + `set-piece` + `ours`). Counts shown are illustrative defaults, not seeded data.

User can add custom tags (`+ new` button in mockup).

## Screens & layout (from mockup `design-mockup.png`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ R RuckCut │ Sharks 25/26 › R12 — Stormers › Match cut │ 🔍 search │ 📤 Export│
├──────┬──────────────────────────────────────────────────┬───────────────────┤
│TOOLS │  ● REC  23:47.12 → 24:01.04  (0:13.92)   1080p│ CLIPS · 8        ⚙ │
│ V I O│                                                  │ [ours ✕]          │
│ S T B│              VIDEO PLAYER                        │ ┌───────────────┐ │
│ D M  │         (or pitch tactical view)                 │ │12:34  Lineout │ │
│      │                                                  │ │       — 5m... │ │
│TAGS  │                                                  │ │ tags...  0:24 │ │
│• line│                                                  │ └───────────────┘ │
│• scrm│                                                  │ ... more clips    │
│• brk │  [⏮ ⏪ ▶ ⏩ ⏭]  23:47.12 / 80:00   0.25x..2x   +Clip │                   │
│ ...  ├──────────────────────────────────────────────────┤                   │
│      │ 00:00  10:00  20:00  30:00  40:00  50:00  60:00  │                   │
│      │ VIDEO ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓       │                   │
│      │ CLIPS [Lineout][Coun][WideBrk][Tackle][...]      │                   │
│      │ NOTES   ①    ②    ③    ④    ⑤                  │                   │
└──────┴──────────────────────────────────────────────────┴───────────────────┘
```

### Header
- Logo + breadcrumb: `<Season>` › `<Round/Match label>` › `<Mode>` (Match cut)
- Global search (clips, tags, players) — keybind `⌘K`
- Export (current clip / playlist → mp4)

### Left rail
- **TOOLS** (8 icons) — `V` select, `I` mark-in, `O` mark-out, `S` split, `T` trim, `B` blade, `D` draw, `M` marker. (Letters in mockup confirm shortcuts.)
- **TAGS** — searchable list, color dot + label + count, click to filter. `+ new` to add a custom tag.

### Center
- Video player (HTML5) with REC strip showing current cut bounds + duration.
- Transport: skip-back, frame-back, play/pause, frame-forward, skip-forward; current time / total; speed selector (0.25x / 0.5x / 1x / 1.5x / 2x); `+ Clip` action (commits current in/out).
- Resolution badge `1080p · 1x`.

### Multi-track timeline (under player)
- `VIDEO` track — waveform/scrubber.
- `CLIPS` track — colored blocks per clip, color = primary tag, label = clip title (truncated), numbered.
- `NOTES` track — pin markers for annotations / pause-frame notes.

### Right rail — Clip list
Each card:
- Start timestamp (e.g., `12:34`)
- Mini visualization (the field-with-dots thumbnail; for v1 we can ship a simpler timeline-bar thumbnail and add field-view later)
- Title + description (from clip metadata)
- Tag chips (multi)
- Duration badge (e.g., `0:14`)
- Notes count (e.g., `5 notes`)

Filter chips at top (e.g., `[ours ✕]`).

### Bottom-left status
Match identity: `Sharks vs Stormers / R12 · 80:00 · 1080p`.

## Implications for the plan

1. **Tag taxonomy in `clip.entity.ts` is updated** — use the 13 tags above; tags are multi-assign; allow user-defined tags persisted to `<platform>/<opponent>/<match>/tags.json`.
2. **Multi-track timeline** is a richer component than originally scoped — three rows (VIDEO / CLIPS / NOTES) with horizontal time scale.
3. **Toolbar with keybinds** — `V/I/O/S/T/B/D/M` should be wired into a `useKeyboardShortcuts` hook; document in CLAUDE.md.
4. **Search-everywhere (`⌘K`)** — adds a `cmdk`-style command palette; defer to v2 if scope is tight, but include shadcn `Command` component in the UI package.
5. **Pitch tactical view** — the dot-on-field visualization (center frame in mockup) is either:
   - A separate viewing mode that overlays player-position data, OR
   - The pause-frame annotation canvas with shaped markers.
   Treat as the v1 annotation canvas (draw arrows, dots, rects on the paused frame), and revisit "true tactical-board" view post-MVP.
6. **Export** — produces an mp4 of a single clip or a concatenated playlist. Backed by ffmpeg `concat demuxer` for playlist export.
7. **Branding** — mockup says "RuckCut"; current repo is `playbook`. Open question for user.

## Reference

- Mockup: `./design-mockup.png`
- Plan: `~/.claude/plans/crispy-sleeping-squirrel.md`
