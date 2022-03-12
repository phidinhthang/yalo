import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useChatStore = create(
  combine(
    {
      conversationOpened: null as null | number,
      typings: {} as Record<string, string[]>,
    },
    (set, get) => ({
      setConversationOpened: (conversationId: number | null) =>
        set({ conversationOpened: conversationId }),
      addTyping: (conversationId: number, username: string) => {
        const typings = { ...get().typings };
        if (typings[conversationId] && Array.isArray(typings[conversationId])) {
          typings[conversationId] = typings[conversationId].filter(
            (u) => u !== username
          );
          typings[conversationId].push(username);
        } else {
          typings[conversationId] = [username];
        }
        set({ typings });
        setTimeout(() => {
          const typings = { ...get().typings };
          typings[conversationId] = typings[conversationId].filter(
            (u) => u !== username
          );
          set({ typings });
        }, 4000);
      },
    })
  )
);
