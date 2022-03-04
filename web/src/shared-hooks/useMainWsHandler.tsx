import React, { useContext } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Message, Conversation } from '../lib/entities';
import { useRefreshToken } from '../modules/auth/useRefreshToken';
import { useTokenStore } from '../modules/auth/useTokenStore';
import { useWsStore } from '../modules/auth/useWsStore';
import { ConnectionContext } from '../modules/conn/ConnectionProvider';
import {
  useTypeSafeUpdateInfiniteQuery,
  useTypeSafeUpdateQuery,
} from './useTypeSafeUpdateQuery';
import { useWrappedConn } from '../modules/conn/useConn';
import { useTypeSafeGetQuery } from './useTypeSafeGetQuery';

export const useMainWsHandler = () => {
  const { ws, setWs } = useWsStore();

  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const getQuery = useTypeSafeGetQuery();
  const accessToken = useTokenStore().accessToken;
  const wConn = useWrappedConn();

  React.useEffect(() => {
    if (accessToken) {
      const ws = io(`${import.meta.env.VITE_API_URL}/ws`, {
        query: { token: accessToken },
      });

      setWs(ws);
    }
  }, [accessToken]);

  React.useEffect(() => {
    ws?.on('toggle_online', (userId: number) => {
      updateQuery('findAll', (users) => {
        return users?.map((u) => {
          if (u.id === userId) u.isOnline = true;
          return u;
        });
      });
      updateQuery('getPaginatedConversations', (conversations) => {
        if (!conversations) return conversations;
        conversations
          .filter((c) => c.type === 'private')
          .forEach((c) => {
            c.members.forEach((m) => {
              if (m.user.id === userId) m.user.isOnline = true;
            });
          });
        return conversations;
      });
    });
    ws?.on('toggle_offline', (userId: number) => {
      updateQuery('findAll', (users) => {
        return users?.map((u) => {
          if (u.id === userId) {
            u.isOnline = false;
            u.lastLoginAt = new Date().toISOString();
          }
          return u;
        });
      });
      updateQuery('getPaginatedConversations', (conversations) => {
        if (!conversations) return conversations;
        conversations
          .filter((c) => c.type === 'private')
          .forEach((c) => {
            c.members.forEach((m) => {
              if (m.user.id === userId) {
                m.user.isOnline = false;
                m.user.lastLoginAt = new Date().toISOString();
              }
            });
          });
        return conversations;
      });
    });

    ws?.on('new_message', async (message: Message) => {
      console.log('new_message', message);
      const conversations = getQuery('getPaginatedConversations');
      if (!conversations) return;
      let conversation = conversations.find(
        (c) => c.id === message.conversation
      );
      if (!conversation) {
        conversation = await wConn.query.getPrivateConversation({
          id: message.creator,
        });
        conversation.lastMessage = message;
        updateQuery('getPaginatedConversations', (conversations) => {
          conversations.unshift(conversation!);
          return conversations;
        });
        return;
      }
      updateInfiniteQuery(
        ['getPaginatedMessages', conversation.id],
        (messages) => {
          messages.pages[0].data.unshift(message);
          return messages;
        }
      );
      updateQuery('getPaginatedConversations', (conversations) => {
        return conversations.map((c) => {
          if (c.id === conversation!.id) {
            c.lastMessage = message;
          }
          return c;
        });
      });
    });

    ws?.on('new_user', (user) => {
      updateQuery('findAll', (users) => (users ? [user, ...users] : users));
    });

    ws?.on('new_conversation', (conversation) => {
      toast.info(
        `You were added to group conversation "${conversation.title}"`,
        { position: 'bottom-left' }
      );
      updateQuery('getPaginatedConversations', (conversations) =>
        conversations ? [conversation, ...conversations] : conversations
      );
    });

    ws?.on('delete_conversation', (conversation: Conversation) => {
      toast.info(
        `Group conversation "${conversation.title} has been deleted"`,
        { position: 'bottom-left' }
      );
      updateQuery('getPaginatedConversations', (conversations) =>
        conversations?.filter((c) => c.id !== conversation.id)
      );
    });

    ws?.on(
      'leave_conversation',
      ({
        userId,
        conversation,
        conversationDeletedReason,
      }: {
        userId: number;
        conversation: Conversation;
        conversationDeletedReason?: 'admin_leave' | 'member_count';
      }) => {
        updateQuery('getPaginatedConversations', (conversations) => {
          if (conversationDeletedReason === 'admin_leave') {
            toast.info(
              `Group conversation "${conversation.title}" has been deleted because admin has left`,
              { position: 'bottom-left' }
            );
          }
          if (conversationDeletedReason === 'member_count') {
            toast.info(
              `Group conversation "${conversation.title}" has been deleted because number of members is <= 2`,
              { position: 'bottom-left' }
            );
          }
          if (conversationDeletedReason) {
            return conversations?.filter((c) => c.id !== conversation.id);
          }
          return conversations?.map((c) => {
            if (c.id === conversation.id) {
              c.members = c.members.filter((m) => m.user.id !== userId);
            }
            return c;
          });
        });
      }
    );

    return () => {
      ws?.off('toggle_online');
      ws?.off('toggle_offline');
      ws?.off('new_message');
      ws?.off('new_user');
      ws?.off('new_conversation');
      ws?.off('delete_conversation');
      ws?.off('leave_conversation');
    };
  }, [ws]);
};

export const MainWsHandlerProvider: React.FC = React.memo(({ children }) => {
  useMainWsHandler();
  const { conn } = useContext(ConnectionContext);
  const { isLoading } = useRefreshToken();
  if (!conn || isLoading) return <></>;
  return <>{children}</>;
});
