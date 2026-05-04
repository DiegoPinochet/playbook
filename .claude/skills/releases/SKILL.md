---
name: releases
description: Use when cutting a Mac release for Playbook, bumping the app version, troubleshooting the publish flow, or changing the GitHub-release packaging. Triggers on "cut a release", "publish to GitHub", "ship a new build", "package for Mac", "bump the version".
---

## Mental model

Releases are **manual, local-first, Mac-only**. There is no CI. The user runs `pnpm release` on their own machine, which:

1. Verifies `gh` is authenticated and the working tree is clean.
2. Builds the Electron bundles via `electron-vite build`.
3. Packages an arm64 `.dmg` + `.zip` via `electron-builder`.
4. Uploads them to GitHub Releases under tag `v<version>` using `electron-builder`'s built-in GitHub publisher (auth via `gh auth token`).

Output lands in `apps/desktop/release/`.

## Files that own the flow

- `apps/desktop/electron-builder.yml` — packaging config + `publish.provider: github` block.
- `apps/desktop/scripts/release.mjs` — the orchestration: pre-flight, build, publish.
- `apps/desktop/package.json` `"version"` — drives the release tag.
- `apps/desktop/package.json` `"scripts"."release"` — entry point.
- Root `package.json` `"release"` — convenience that calls the desktop one via pnpm filter.

## Cutting a release

```bash
# 1. Bump version
#    edit apps/desktop/package.json: "version": "0.1.1"
# 2. Commit
git add apps/desktop/package.json && git commit -m "🔖 v0.1.1"
# 3. Release
pnpm release
```

## Version bump policy

**Default to a patch bump** (e.g. `0.2.1 → 0.2.2`), even when the release ships new features. Don't apply standard semver feature/breaking heuristics — the user's convention treats the patch component as the normal release counter while in the `0.x` line. Only go to a minor bump (`0.2.x → 0.3.0`) when the user explicitly says so. Same rule for `0.x → 1.0` — wait for the user.

The script blocks if:
- `gh` is not installed or not authenticated (`gh auth login`)
- The working tree has uncommitted changes
- The tag `v<version>` already exists on origin (bump version first)

## Common failure modes

- **"Tag v0.1.0 already exists on origin"** → bump `apps/desktop/package.json` then commit.
- **"GH_TOKEN missing"** → `gh auth login` and re-run.
- **"hdiutil: Resource busy"** → another build is running or Finder has the dmg mounted; close it.
- **First-launch warning "Unidentified developer"** → expected; we don't sign or notarize. Right-click → Open the first time.
- **electron-builder hangs on icon generation** → no app icon configured yet. Add `mac.icon: build/icon.icns` to `electron-builder.yml` once we ship one.

## Adding x64 builds later

Apple Silicon-only by default. To also ship Intel, add `x64` to the `arch` arrays in both `target` blocks of `electron-builder.yml`. Build time roughly doubles.

## Adding signing / notarization later

For a signed, Gatekeeper-clean build:

1. Apple Developer Program membership (~$99/yr).
2. Generate a Developer ID Application certificate, export to `.p12`.
3. Add to `electron-builder.yml`:
   ```yaml
   mac:
     hardenedRuntime: true
     gatekeeperAssess: true
     identity: "Developer ID Application: <Your Name> (<TEAM_ID>)"
     notarize:
       teamId: <TEAM_ID>
   ```
4. Set env vars before `pnpm release`: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `CSC_LINK` (path to .p12), `CSC_KEY_PASSWORD`.

Until then, the `identity: null` in `electron-builder.yml` keeps electron-builder from attempting to sign with a missing cert.

## Publishing changelogs

`electron-builder` creates the GitHub release with an empty body. Edit it on GitHub afterwards (`gh release edit v<version> --notes "..."`) or pre-stage notes by setting `releaseNotes` in `electron-builder.yml`.
