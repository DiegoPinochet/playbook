import { create } from "zustand";
import type {
  OpponentCreateInput,
  OpponentEntity,
  OpponentUpdateInput,
} from "@playbook/business-logic";

type OpponentsStore = {
  opponents: OpponentEntity[];
  loading: boolean;
  load: (platform: string) => Promise<void>;
  create: (platform: string, input: OpponentCreateInput) => Promise<OpponentEntity>;
  update: (platform: string, input: OpponentUpdateInput) => Promise<OpponentEntity>;
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
  update: async (platform, input) => {
    const updated = await window.api.opponents.update(platform, input);
    set({ opponents: get().opponents.map((o) => (o.id === updated.id ? updated : o)) });
    return updated;
  },
  remove: async (platform, id) => {
    await window.api.opponents.delete(platform, id);
    set({ opponents: get().opponents.filter((o) => o.id !== id) });
  },
}));
