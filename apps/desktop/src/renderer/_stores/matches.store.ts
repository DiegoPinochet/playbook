import { create } from "zustand";
import type { MatchEntity } from "@playbook/business-logic";

type MatchesStore = {
  matches: MatchEntity[];
  loading: boolean;
  load: (platform: string, opponentSlug: string) => Promise<void>;
  remove: (platform: string, opponentSlug: string, matchId: string) => Promise<void>;
};

export const useMatchesStore = create<MatchesStore>((set, get) => ({
  matches: [],
  loading: false,
  load: async (platform, opponentSlug) => {
    set({ loading: true });
    const matches = await window.api.matches.list(platform, opponentSlug);
    set({ matches, loading: false });
  },
  remove: async (platform, opponentSlug, matchId) => {
    await window.api.matches.delete(platform, opponentSlug, matchId);
    set({ matches: get().matches.filter((m) => m.id !== matchId) });
  },
}));
