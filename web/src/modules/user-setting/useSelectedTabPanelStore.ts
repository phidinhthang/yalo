import create from 'zustand';
import { combine } from 'zustand/middleware';

export type AvailableTab = 'my-account' | 'user-profile';

export const useSelectedTabPanelStore = create(
  combine(
    {
      selectedTab: 'my-account' as AvailableTab,
    },
    (set) => ({
      setSelectedTab: (tab: AvailableTab) => set({ selectedTab: tab }),
    })
  )
);
