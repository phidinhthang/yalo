import create from 'zustand';
import { combine } from 'zustand/middleware';

type AvailablePanel =
  | 'outgoing-friend-request'
  | 'incoming-friend-request'
  | 'friend-search';

export const useMainPanelOpenStore = create(
  combine({ open: 'incoming-friend-request' as AvailablePanel }, (set) => ({
    setOpen: (open: AvailablePanel) => set({ open }),
  }))
);
