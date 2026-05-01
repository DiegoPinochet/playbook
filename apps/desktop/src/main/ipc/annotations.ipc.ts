import {
  deleteAnnotationUseCase,
  listAnnotationsUseCase,
  saveAnnotationUseCase,
  type AnnotationCreateInput,
  type AnnotationEntity,
} from "@playbook/business-logic";
import { handle } from "./_helpers";

export function registerAnnotationsHandlers(): void {
  handle<[string, string, string], AnnotationEntity[]>(
    "annotations.list",
    (_e, platform, opponentSlug, matchSlug) =>
      listAnnotationsUseCase(platform, opponentSlug, matchSlug)
  );

  handle<[string, string, string, AnnotationCreateInput], AnnotationEntity>(
    "annotations.save",
    (_e, platform, opponentSlug, matchSlug, input) =>
      saveAnnotationUseCase(platform, opponentSlug, matchSlug, input)
  );

  handle<[string, string, string, string], void>(
    "annotations.delete",
    (_e, platform, opponentSlug, matchSlug, id) =>
      deleteAnnotationUseCase(platform, opponentSlug, matchSlug, id)
  );
}
