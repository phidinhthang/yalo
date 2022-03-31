import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useChatStore = create(
  combine(
    {
      conversationOpened: null as null | number,
    },
    (set, get) => ({
      setConversationOpened: (conversationId: number | null) =>
        set({ conversationOpened: conversationId }),
    })
  )
);
