# Zustand stores

Stores live in `apps/desktop/src/renderer/_stores/<domain>.store.ts`.

## Pattern

```ts
import { create } from "zustand";
import type { OpponentEntity, OpponentCreateInput } from "@playbook/business-logic";

type OpponentsStore = {
  opponents: OpponentEntity[];
  loading: boolean;
  load: (platform: string) => Promise<void>;
  create: (platform: string, input: OpponentCreateInput) => Promise<OpponentEntity>;
};

export const useOpponentsStore = create<OpponentsStore>((set, get) => ({
  opponents: [],
  loading: false,
  load: async (platform) => {
    set({ loading: true });
    const data = await window.api.opponents.list(platform);
    set({ opponents: data, loading: false });
  },
  create: async (platform, input) => {
    const created = await window.api.opponents.create(platform, input);
    set({ opponents: [...get().opponents, created] });
    return created;
  },
}));
```

## Rules

- Stores call `window.api.*` directly. No fetch, no IPC plumbing.
- Stores hold **server-of-truth state** (entities loaded from disk) and very simple derived state. Don't put transient UI state (modals open, scrub position) into stores — keep that in component `useState`.
- One store per domain (`opponents`, `matches`, `clips`, `settings`). Cross-domain reads happen in components by selecting from multiple stores.
- Never persist store state — the filesystem is the source of truth, and `load()` re-reads on mount.
