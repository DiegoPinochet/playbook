import { randomUUID } from "node:crypto";
import { opponentRepository, slugify } from "@playbook/file-system";
import {
  opponentCreateInputSchema,
  type OpponentCreateInput,
  type OpponentEntity,
} from "../opponent.entity";

export async function createOpponentUseCase(
  platformFolder: string,
  input: OpponentCreateInput
): Promise<OpponentEntity> {
  const parsed = opponentCreateInputSchema.parse(input);
  const slug = await opponentRepository.uniqueSlug(platformFolder, slugify(parsed.name));
  const entity: OpponentEntity = {
    id: randomUUID(),
    name: parsed.name,
    slug,
    color: parsed.color ?? "#3b82f6",
    notes: parsed.notes ?? "",
    createdAt: new Date().toISOString(),
  };
  await opponentRepository.create(platformFolder, entity);
  return entity;
}
