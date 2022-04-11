import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useChatStore = create(
  combine(
    {
      conversationOpened: null as null | number,
      replyTo: null as null | number,
    },
    (set, get) => ({
      setConversationOpened: (conversationId: number | null) =>
        set({ conversationOpened: conversationId }),
      setReplyTo: (messageId: number) => set({ replyTo: messageId }),
      resetReply: () => set({ replyTo: null }),
    })
  )
);
