import create from 'zustand';
import { combine } from 'zustand/middleware';

type AvailablePanel =
  | null
  | 'outgoing-friend-request'
  | 'incoming-friend-request'
  | 'friend-search';

export const useMainPanelOpenStore = create(
  combine({ open: null as AvailablePanel }, (set) => ({
    setOpen: (open: AvailablePanel) => set({ open }),
  }))
);
