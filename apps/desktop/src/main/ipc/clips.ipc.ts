import {
  createClipUseCase,
  createCustomTagUseCase,
  deleteClipUseCase,
  listClipsUseCase,
  listTagsUseCase,
  updateClipUseCase,
  type ClipCreateInput,
  type ClipEntity,
  type ClipUpdateInput,
  type CreateCustomTagInput,
  type TagEntity,
} from "@playbook/business-logic";
import { handle } from "./_helpers";

export function registerClipsHandlers(): void {
  handle<[string, string, string], ClipEntity[]>(
    "clips.list",
    (_e, platform, opponentSlug, matchSlug) => listClipsUseCase(platform, opponentSlug, matchSlug)
  );

  handle<[string, string, string, ClipCreateInput], ClipEntity>(
    "clips.create",
    (_e, platform, opponentSlug, matchSlug, input) =>
      createClipUseCase(platform, opponentSlug, matchSlug, input)
  );

  handle<[string, string, string, ClipUpdateInput], ClipEntity>(
    "clips.update",
    (_e, platform, opponentSlug, matchSlug, input) =>
      updateClipUseCase(platform, opponentSlug, matchSlug, input)
  );

  handle<[string, string, string, string], void>(
    "clips.delete",
    (_e, platform, opponentSlug, matchSlug, clipId) =>
      deleteClipUseCase(platform, opponentSlug, matchSlug, clipId)
  );

  handle<[string], TagEntity[]>("clips.listTags", (_e, platform) => listTagsUseCase(platform));

  handle<[string, CreateCustomTagInput], TagEntity>(
    "clips.createCustomTag",
    (_e, platform, input) => createCustomTagUseCase(platform, input)
  );
}
