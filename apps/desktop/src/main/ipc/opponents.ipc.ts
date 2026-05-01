import {
  createOpponentUseCase,
  deleteOpponentUseCase,
  getOpponentUseCase,
  listOpponentsUseCase,
  type OpponentCreateInput,
  type OpponentEntity,
} from "@playbook/business-logic";
import { handle } from "./_helpers";

export function registerOpponentsHandlers(): void {
  handle<[string], OpponentEntity[]>("opponents.list", (_e, platform) =>
    listOpponentsUseCase(platform)
  );

  handle<[string, string], OpponentEntity | null>("opponents.get", (_e, platform, id) =>
    getOpponentUseCase(platform, id)
  );

  handle<[string, OpponentCreateInput], OpponentEntity>("opponents.create", (_e, platform, input) =>
    createOpponentUseCase(platform, input)
  );

  handle<[string, string], void>("opponents.delete", (_e, platform, id) =>
    deleteOpponentUseCase(platform, id)
  );
}
