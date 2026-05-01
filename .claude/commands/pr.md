---
description: Create a pull request for the current branch.
allowed-tools: Bash
---

## Step 1: Gather context

Run in parallel:
- `git status`
- `git log --oneline main..HEAD`
- `git diff main...HEAD --stat`
- `gh repo view --json defaultBranchRef -q '.defaultBranchRef.name'`

If there are uncommitted changes, stop and ask the user to run `/commit` first.

## Step 2: Branch name

If on `main`, create a new branch named `<type>/<short>`: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`. kebab-case, ≤ 4 words.

`git checkout -b <name> && git push -u origin <name>`

## Step 3: Push (if not already)

If the branch has no upstream: `git push -u origin HEAD`.

## Step 4: PR body

**Title**: imperative, ≤ 60 chars, no emoji, no period.

**Body**:

```
## What
- <1-3 bullets — what changed and why>

## How
<Non-obvious implementation details worth reviewing. Omit if straightforward.>

## Checklist
- [ ] Follows project conventions
- [ ] No sensitive data exposed
- [ ] Tested locally (`pnpm dev`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Create:
```bash
gh pr create --title "<title>" --base <base> --body "$(cat <<'EOF'
<body>
EOF
)"
```

## Step 5: Return the URL.
