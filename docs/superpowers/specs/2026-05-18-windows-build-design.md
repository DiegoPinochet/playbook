# Windows build support for Playbook

**Date:** 2026-05-18
**Status:** Approved (design phase)
**Author:** brainstorming session

## Problem

Playbook currently ships only for macOS (arm64 DMG + zip). The Electron + React + Node code is already cross-platform — the gap is entirely in packaging and release plumbing:

- `apps/desktop/package.json` defines `dist` as `electron-vite build && electron-builder --mac`.
- `apps/desktop/electron-builder.yml` only configures a `mac:` target.
- `apps/desktop/scripts/release.mjs` is hard-coded to `--mac --arm64`.
- There is no `build/icon.ico` and no Windows entry on the GitHub Release.

The goal is to add a Windows distribution channel without changing application code.

## Non-goals

- No auto-update wiring (no `electron-updater` in main). electron-builder will still emit `latest.yml` / `latest-mac.yml` so this can be added later without re-architecting.
- No code signing on either platform. Mac is already unsigned (`identity: null`, `hardenedRuntime: false`); Windows ships unsigned too.
- No CI for pull requests. The only new automation is a release workflow that fires on `v*` tags.
- No support for Windows arm64 or ia32. x64 only.
- No changes to renderer, main, preload, IPC handlers, business logic, or repositories.

## Scope

### Distribution

- **Target:** Windows 10+ x64.
- **Installer format:** NSIS (`.exe`).
- **Signing:** unsigned. Users will hit a SmartScreen "Windows protected your PC" warning on first launch (Click "More info" → "Run anyway"). README documents this.
- **Build host:** GitHub Actions `windows-latest`. No local cross-builds from macOS via Wine.

### Build pipeline

A single release workflow at `.github/workflows/release.yml` runs on push of a `v*` tag. Matrix:

| os             | platform | electron-builder args  |
|----------------|----------|------------------------|
| macos-latest   | mac      | `--mac --arm64`        |
| windows-latest | win      | `--win --x64`          |

Both matrix legs publish artifacts to the same GitHub Release (electron-builder dedupes by tag).

The existing `apps/desktop/scripts/release.mjs` is generalized to accept a `--platform mac|win` flag and is the single entry point used by both local-Mac releases and CI. This avoids two divergent build paths.

### Files

#### New

- **`apps/desktop/build/icon.ico`** — committed binary. Multi-resolution Windows icon (16/24/32/48/64/128/256) generated from the existing `build/icon.png` (1024×1024 RGBA).
- **`apps/desktop/scripts/build-icon.mjs`** — Node script using `png-to-ico` to read `build/icon.png` and write `build/icon.ico`. Re-runnable so the icon stays reproducible from source PNG.
- **`.github/workflows/release.yml`** — release workflow. Triggers: `push` of tags matching `v*`. Matrix of macos-latest and windows-latest. Each leg:
  1. `actions/checkout@v4`
  2. `pnpm/action-setup@v4` (version pinned to `10.4.1` to match `packageManager` field)
  3. `actions/setup-node@v4` with `node-version: 20` and `cache: pnpm`
  4. `pnpm install --frozen-lockfile`
  5. `pnpm -F @playbook/desktop run release -- --platform=<mac|win>`
  Env: `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. `contents: write` permission on the job.

#### Modified

- **`apps/desktop/electron-builder.yml`**
  - Keep all existing `mac:` config and `publish:` block.
  - Add `win:` section:
    ```yaml
    win:
      icon: build/icon.ico
      target:
        - target: nsis
          arch:
            - x64
    ```
  - Add `nsis:` section:
    ```yaml
    nsis:
      oneClick: false
      perMachine: false
      allowToChangeInstallationDirectory: true
      shortcutName: Playbook
      uninstallDisplayName: Playbook
    ```
    Rationale: `oneClick: false` + `allowToChangeInstallationDirectory: true` gives users an explicit install dialog (more trustworthy for an unsigned app). `perMachine: false` means per-user install so no UAC elevation is required.

- **`apps/desktop/package.json`**
  - Add devDependency: `png-to-ico` (current major).
  - Scripts:
    - `dist:mac`: `electron-vite build && electron-builder --mac --arm64`
    - `dist:win`: `electron-vite build && electron-builder --win --x64`
    - `dist`: alias for `dist:mac` (preserves current local-dev behaviour on the maintainer's Mac).
    - `icon:win`: `node ./scripts/build-icon.mjs`
    - `release`: unchanged invocation, but `release.mjs` itself now parses `--platform`.

- **`apps/desktop/scripts/release.mjs`**
  - Parse `--platform mac|win` from argv. Default: `mac` (matches today's behaviour for the maintainer's local workflow).
  - Choose `electron-builder` args per platform:
    - mac → `["--mac", "--arm64", "--publish", "always"]`
    - win → `["--win", "--x64", "--publish", "always"]`
  - Pre-flight checks: gate the `gh auth token` / clean-working-tree checks behind "is this a local invocation?" If `process.env.CI === "true"`, skip the gh-cli check (use `GH_TOKEN` from env directly) and skip the clean-tree check (CI is always clean from a fresh checkout). Tag pre-existence check stays — useful in both contexts.
  - The workspace-symlink removal + restore dance stays exactly as is. It is load-bearing because electron-builder rejects pnpm's `node_modules/@playbook/*` symlinks; the same problem exists on Windows runners.

- **`README.md`**
  - Add Windows entry to the download/install section.
  - Note the SmartScreen warning + how to bypass it ("More info" → "Run anyway").

### Verification plan

1. **Local Mac sanity:** `pnpm -F @playbook/desktop run dist:mac` still produces `Playbook-<version>-arm64.dmg` and `.zip` in `apps/desktop/release/`. Diff against current artifact names — must match.
2. **Icon reproducibility:** `pnpm -F @playbook/desktop run icon:win` produces `apps/desktop/build/icon.ico`. `file apps/desktop/build/icon.ico` reports a valid Windows icon. Re-running is idempotent.
3. **CI dry-run:** push a throwaway tag `v0.3.1-rc.0`. Confirm:
   - Both matrix legs succeed.
   - GitHub Release contains: `Playbook-<v>-arm64.dmg`, `Playbook-<v>-arm64.zip`, `Playbook-<v>-x64.exe`, plus electron-builder metadata files (`latest.yml`, `latest-mac.yml`).
   - Then delete the release and tag (both locally and on origin).
4. **Manual Windows smoke:** download the `.exe` on a real Windows machine, click through the SmartScreen warning, install, launch, import a sample video, tag a clip, export a cut. Confirm ffmpeg runs and the platform folder is created.

### Risks / open questions

- **electron-builder + pnpm symlinks on Windows runners.** The symlink removal in `release.mjs` works on Mac. On Windows the same `rmSync(WORKSPACE_LINK_DIR, { recursive: true, force: true })` should also work, but pnpm uses junctions (not POSIX symlinks) on Windows. We rely on Node's `rmSync` handling junctions correctly, which it does in Node 20+. Captured as a watch-point during the CI dry-run.
- **ffmpeg-static on Windows.** `ffmpeg-static` already ships a `win32-x64` binary. The `ffmpegBinary()` helper at `apps/desktop/src/main/ffmpeg/runner.ts` already does the `app.asar` → `app.asar.unpacked` rewrite, which is the same on both platforms. Expected to just work.
- **artifactName collisions.** Current pattern is `${productName}-${version}-${arch}.${ext}`. For Mac (`arm64`) and Windows (`x64`) the `arch` segment disambiguates — no collision. Confirmed.
- **The `publish:` block in electron-builder.yml** triggers a publish when `--publish always` is passed. Both matrix legs use `--publish always`, so the second one to finish reuses the existing GitHub Release rather than creating a duplicate. This is electron-builder's documented behaviour.

## Out of scope (future work)

- Code signing for Mac (Developer ID Application cert) and Windows (EV or OV cert).
- Auto-update via `electron-updater` reading from the GitHub release feed.
- Windows arm64 build (only relevant once Surface Pro X / Snapdragon laptops are common in the user base).
- A `release-please` style automatic version-bump PR.
