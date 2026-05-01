---
name: file-system-storage
description: Use when changing the on-disk JSON shape, adding a new entity to persist, or writing/reading anything from the platform folder. Triggers on "store on disk", "add a new repository", "change the schema", "what's saved where".
---

## On-disk layout

```
<platformFolder>/
└── <opponentSlug>/
    ├── opponent.json
    └── <matchSlug>/
        ├── match.json
        ├── video.<ext>
        ├── tags.json              ← user-defined custom tags (in addition to defaults from code)
        ├── players.json           ← roster
        ├── clips/<uuid>.json      ← one file per clip
        └── annotations/
            ├── <uuid>.json        ← annotation metadata
            └── <uuid>.png         ← extracted frame thumbnail
```

User settings (separate from platform folder):
```
<userData>/settings.json           ← Electron app.getPath('userData')
```

## Path helpers

Always go through `paths.*` from `@playbook/file-system`:

- `paths.opponentDir(platform, opponentSlug)`
- `paths.opponentMetaFile(platform, opponentSlug)`
- `paths.matchDir(platform, opponentSlug, matchSlug)`
- `paths.matchMetaFile(...)`
- `paths.clipsDir(...)`, `paths.clipFile(..., clipId)`
- `paths.annotationsDir(...)`, `paths.annotationFile(..., id)`, `paths.annotationThumbnail(..., fileName)`
- `paths.playersFile(...)`, `paths.tagsFile(...)`
- `paths.settingsFile(userDataDir)`

## Atomic writes

Every JSON write goes through `atomicWriteJson(path, data)`. It:
1. Ensures the parent directory exists.
2. Writes to `path.<random>.tmp`.
3. Renames to the final path (atomic on POSIX).

Never write directly with `fs.writeFile`.

## Adding a new persisted shape

1. Define the entity + Zod schema in `packages/business-logic/src/<domain>/<noun>.entity.ts`.
2. Add a `<noun>Repository` in `packages/file-system/src/repositories/<noun>.repository.ts` with `list`/`getById`/`create`/`update`/`remove` (or a smaller subset).
3. Add a `paths.<noun>*` helper in `packages/file-system/src/paths.ts`.
4. Export the repository from `packages/file-system/src/index.ts`.
5. Add use cases in `packages/business-logic/src/<domain>/use-cases/`.

## Schema migrations

If you change a stored shape, you have two options:

- **Additive change** (new optional field): no migration. Existing files load fine; the new field is `undefined` and your Zod default fills it.
- **Breaking change**: add a `version` field on the entity. In the repository's `list`/`getById`, detect missing/old version and migrate the JSON in-place using `atomicWriteJson`.

Avoid breaking changes when you can — the user's local data is precious.

## Slugs

`slugify(input)` produces a kebab-case ASCII slug. For uniqueness, use `repository.uniqueSlug(...)` which appends `-2`, `-3`... when the base collides with an existing folder.
