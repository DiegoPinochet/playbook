import { opponentRepository } from "@playbook/file-system";
import { opponentSchema, type OpponentEntity } from "../opponent.entity";

export type OpponentUpdateInput = {
  id: string;
  name?: string;
  color?: string;
  notes?: string;
};

export async function updateOpponentUseCase(
  platformFolder: string,
  input: OpponentUpdateInput
): Promise<OpponentEntity> {
  const existing = await opponentRepository.getById(platformFolder, input.id);
  if (!existing) {
    throw new Error(`Opponent not found: ${input.id}`);
  }
  const next = opponentSchema.parse({
    ...existing,
    name: input.name ?? existing.name,
    color: input.color ?? existing.color,
    notes: input.notes ?? existing.notes,
  });
  await opponentRepository.update(platformFolder, next);
  return next;
}
