import { create } from "zustand";
import type { ClipCreateInput, ClipEntity, ClipUpdateInput, TagEntity } from "@playbook/business-logic";

type Ctx = { platform: string; opponentSlug: string; matchSlug: string };

type ClipsStore = {
  clips: ClipEntity[];
  tags: TagEntity[];
  loading: boolean;
  load: (ctx: Ctx) => Promise<void>;
  create: (ctx: Ctx, input: ClipCreateInput) => Promise<ClipEntity>;
  update: (ctx: Ctx, input: ClipUpdateInput) => Promise<ClipEntity>;
  remove: (ctx: Ctx, clipId: string) => Promise<void>;
  createCustomTag: (ctx: Ctx, label: string, color?: string) => Promise<TagEntity>;
};

export const useClipsStore = create<ClipsStore>((set, get) => ({
  clips: [],
  tags: [],
  loading: false,
  load: async (ctx) => {
    set({ loading: true });
    const [clips, tags] = await Promise.all([
      window.api.clips.list(ctx.platform, ctx.opponentSlug, ctx.matchSlug),
      window.api.clips.listTags(ctx.platform, ctx.opponentSlug, ctx.matchSlug),
    ]);
    set({ clips, tags, loading: false });
  },
  create: async (ctx, input) => {
    const created = await window.api.clips.create(ctx.platform, ctx.opponentSlug, ctx.matchSlug, input);
    set({ clips: [...get().clips, created].sort((a, b) => a.startSec - b.startSec) });
    return created;
  },
  update: async (ctx, input) => {
    const updated = await window.api.clips.update(ctx.platform, ctx.opponentSlug, ctx.matchSlug, input);
    set({
      clips: get()
        .clips.map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => a.startSec - b.startSec),
    });
    return updated;
  },
  remove: async (ctx, clipId) => {
    await window.api.clips.delete(ctx.platform, ctx.opponentSlug, ctx.matchSlug, clipId);
    set({ clips: get().clips.filter((c) => c.id !== clipId) });
  },
  createCustomTag: async (ctx, label, color) => {
    const tag = await window.api.clips.createCustomTag(ctx.platform, ctx.opponentSlug, ctx.matchSlug, {
      label,
      color,
    });
    set({ tags: [...get().tags, tag] });
    return tag;
  },
}));
