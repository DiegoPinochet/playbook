# Playbook

Local-first desktop app for tagging, cutting and reviewing rugby match footage of rival teams.

- Electron + React + TypeScript
- shadcn/ui (base-nova) + Tailwind 4
- Filesystem-as-database (no backend, no cloud)
- Monorepo: `apps/desktop` + `packages/{ui,business-logic,file-system}`

## Install (Mac, Apple Silicon)

1. Go to **[Releases](https://github.com/DiegoPinochet/playbook/releases)** and grab the latest `Playbook-<version>-arm64.dmg`.
2. Open the dmg, drag **Playbook** to Applications.
3. First launch: right-click the app → **Open** (the build is unsigned, so Gatekeeper will warn the first time).

## Develop

```bash
pnpm install
pnpm dev      # launches the Electron window with HMR
pnpm lint     # tsc --noEmit across all packages
pnpm dist     # build the local dmg without publishing (output in apps/desktop/release/)
```

## Cut a release (Mac arm64, manual)

The release flow runs locally on your machine and uploads to GitHub. Pre-reqs:
`gh` authenticated (`gh auth status`) with `repo` scope, and a clean working tree.

```bash
# 1. Bump the version in apps/desktop/package.json
#    e.g. "version": "0.1.1"

# 2. Commit the bump
git add apps/desktop/package.json && git commit -m "🔖 v0.1.1"

# 3. Cut the release
pnpm release
```

What `pnpm release` does:
1. Verifies `gh` is logged in and the working tree is clean.
2. Builds main + preload + renderer (`electron-vite build`).
3. Builds the arm64 `.dmg` + `.zip` with `electron-builder`.
4. Publishes them to GitHub Releases under the tag `v<version>` (auto-creates the tag).

After it finishes, the release URL is printed.
