# Repositories

Repositories are the only code that touches the filesystem.

## Rules

1. Live in `packages/file-system/src/repositories/<domain>.repository.ts`.
2. Export a single object (`<domain>Repository`) with methods, not a class.
3. Construct paths with `paths.*` helpers — never concatenate by hand.
4. JSON writes use `atomicWriteJson` (temp file + atomic rename).
5. JSON reads use `readJson<T>(path)` which returns `null` on ENOENT and throws otherwise.
6. Never throw on "not found" — return `null` (single) or `[]` (list). Throw only on real I/O errors.
7. Use cases call repositories; nothing else does.

## Shape

```ts
import { mkdir, readdir, rm } from "node:fs/promises";
import { atomicWriteJson, readJson } from "../atomic-write";
import * as paths from "../paths";

type ClipRecord = { /* same shape as ClipEntity */ };

export const clipRepository = {
  async list(platform, opponentSlug, matchSlug): Promise<ClipRecord[]> { ... },
  async getById(platform, opponentSlug, matchSlug, id): Promise<ClipRecord | null> { ... },
  async create(platform, opponentSlug, matchSlug, record): Promise<void> { ... },
  async update(platform, opponentSlug, matchSlug, record): Promise<void> { ... },
  async remove(platform, opponentSlug, matchSlug, id): Promise<void> { ... },
};
```

## Slugs

- Use `slugify(input)` for human-readable folder names.
- For uniqueness, use `<domain>Repository.uniqueSlug(...)` which appends `-2`, `-3`, ... when collisions occur.

## Atomic writes

- `atomicWriteJson(path, data)` writes to `path.<random>.tmp` then `rename(tmp, path)`. This survives mid-write crashes without corrupting the destination.
- For non-JSON binary writes (e.g., ffmpeg outputs), prefer ffmpeg's own output, then handle file moves in main.
