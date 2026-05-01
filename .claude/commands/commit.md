---
description: Stage and commit changes using Gitmoji with a brief message.
allowed-tools: Bash
---

Stage and commit all changes using Gitmoji conventions. Follow these steps exactly.

## Step 1: Inspect the working tree

Run these in parallel:
- `git status`
- `git diff`
- `git diff --cached`
- `git log --oneline -5`

## Step 2: Pick one Gitmoji

| Emoji | When |
|---|---|
| ✨ | New feature |
| 🐛 | Bug fix |
| 🩹 | Simple / non-critical fix |
| ♻️ | Refactor (no behavior change) |
| 💄 | UI / style change |
| 📝 | Documentation |
| 🔧 | Config or tooling |
| 📦 | Add or update dependencies |
| 🗑️ | Remove code or files |
| ✅ | Add or update tests |
| 🏗️ | Architecture change |
| 🔒 | Security fix |
| 🚀 | Performance |
| 🎬 | Video / playback / ffmpeg work |
| 💾 | File-system schema or persistence change |

Pick the emoji that describes the most significant change.

## Step 3: Message format

`<emoji> <brief description>` — lowercase, no trailing period, ≤ 60 chars.
Example: `✨ add player action report`.

## Step 3.5: Verify before committing

```bash
pnpm lint
```

Run `/verify-patterns` and fix anything it surfaces. Only commit when lint and pattern checks are clean.

## Step 4: Stage and commit

Stage specific files (never `git add -A` / `git add .`). Commit with HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<emoji> <message>
EOF
)"
```

Never use `--no-verify`. If the hook fails, fix and create a NEW commit.

## Step 5: Confirm

Output the commit hash and message.
