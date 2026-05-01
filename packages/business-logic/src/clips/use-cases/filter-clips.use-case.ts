import type { ClipEntity, ClipFilter } from "../clip.entity";

export function filterClipsUseCase(clips: ClipEntity[], filter: ClipFilter): ClipEntity[] {
  const search = filter.search?.trim().toLowerCase();
  return clips.filter((clip) => {
    if (filter.tagIds?.length && !filter.tagIds.every((t) => clip.tagIds.includes(t))) {
      return false;
    }
    if (
      filter.playerNumbers?.length &&
      !filter.playerNumbers.every((n) => clip.playerNumbers.includes(n))
    ) {
      return false;
    }
    if (search) {
      const haystack = `${clip.title} ${clip.description}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}
