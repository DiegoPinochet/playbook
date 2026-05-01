import { create } from "zustand";
import type { OpponentCreateInput, OpponentEntity } from "@playbook/business-logic";

type OpponentsStore = {
  opponents: OpponentEntity[];
  loading: boolean;
  load: (platform: string) => Promise<void>;
  create: (platform: string, input: OpponentCreateInput) => Promise<OpponentEntity>;
  remove: (platform: string, id: string) => Promise<void>;
};

export const useOpponentsStore = create<OpponentsStore>((set, get) => ({
  opponents: [],
  loading: false,
  load: async (platform) => {
    set({ loading: true });
    const opponents = await window.api.opponents.list(platform);
    set({ opponents, loading: false });
  },
  create: async (platform, input) => {
    const created = await window.api.opponents.create(platform, input);
    set({ opponents: [...get().opponents, created] });
    return created;
  },
  remove: async (platform, id) => {
    await window.api.opponents.delete(platform, id);
    set({ opponents: get().opponents.filter((o) => o.id !== id) });
  },
}));
