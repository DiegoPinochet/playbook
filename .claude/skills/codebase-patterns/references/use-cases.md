# Use cases

A use case is a framework-free async function that:

1. Parses its input via a Zod schema (when there is mutable input).
2. Calls one or more repository methods.
3. Returns an entity (or `void`).
4. **Throws** on invalid input or unexpected state. The IPC layer translates the throw into `{ ok: false, error }`.

## Naming

- Filename: `<verb>-<noun>.use-case.ts` (kebab-case).
- Export: `<verbNoun>UseCase`.
- Folder: `packages/business-logic/src/<domain>/use-cases/`.

## Shape

```ts
import { randomUUID } from "node:crypto";
import { clipRepository } from "@playbook/file-system";
import { clipCreateInputSchema, type ClipCreateInput, type ClipEntity } from "../clip.entity";

export async function createClipUseCase(
  platformFolder: string,
  opponentSlug: string,
  matchSlug: string,
  input: ClipCreateInput
): Promise<ClipEntity> {
  const parsed = clipCreateInputSchema.parse(input);
  if (parsed.endSec <= parsed.startSec) throw new Error("Clip end must be after start");

  const entity: ClipEntity = {
    id: randomUUID(),
    matchId: parsed.matchId,
    title: parsed.title,
    description: parsed.description ?? "",
    startSec: parsed.startSec,
    endSec: parsed.endSec,
    tagIds: parsed.tagIds ?? [],
    playerNumbers: parsed.playerNumbers ?? [],
    createdAt: new Date().toISOString(),
  };

  await clipRepository.create(platformFolder, opponentSlug, matchSlug, entity);
  return entity;
}
```

## Don'ts

- Don't import `electron`, `react`, `@playbook/ui`, or anything from `apps/desktop/`.
- Don't catch errors here — let them propagate to IPC.
- Don't shape strings for UI (no translations, no formatting). Return entities; renderer formats.
- Don't call repositories from inside an entity file — entities are pure schemas/types.

## Entities

- Filename: `<noun>.entity.ts`.
- Always Zod schema first, then `type X = z.infer<typeof xSchema>`.
- Add input schemas (`xCreateInputSchema`, `xUpdateInputSchema`) when shapes differ from the stored entity.
- Re-export from `packages/business-logic/src/index.ts`.
