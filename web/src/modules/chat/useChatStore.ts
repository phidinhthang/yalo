import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useChatStore = create(
  combine(
    {
      conversationOpened: null as null | number,
      message: '',
    },
    (set) => ({
      setMessage: (message: string) => set({ message }),
      setConversationOpened: (conversationId: number | null) =>
        set({ conversationOpened: conversationId }),
    })
  )
);
