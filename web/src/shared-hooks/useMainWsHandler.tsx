import React, { useContext } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Message, Conversation, User } from '../lib/api/entities';
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
import { useTypeSafeTranslation } from './useTypeSafeTranslation';
import { useChatStore } from '../modules/chat/useChatStore';
import { Button } from '../ui/Button';
import { useTypeSafePrefetch } from './useTypeSafePrefetch';

export const useMainWsHandler = () => {
  const { ws, setWs } = useWsStore();

  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const getQuery = useTypeSafeGetQuery();
  const accessToken = useTokenStore().accessToken;
  const wConn = useWrappedConn();
  const { t } = useTypeSafeTranslation();
  const prefetchQuery = useTypeSafePrefetch();

  const updateRelationship = async (
    userId: number,
    field: 'isFriend' | 'meRequestFriend' | 'userRequestFriend',
    value: boolean
  ) => {
    await prefetchQuery(['getUserInfo', userId!]);
    updateQuery(['getUserInfo', userId!], (user) => {
      if (user) {
        user[field] = value;
      }
      return user;
    });
  };

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

    ws?.on('new_friend_request', async (requester: Omit<User, 'password'>) => {
      toast.info(
        <div>
          {requester.username} send a friend request <Button>Accept</Button>
        </div>
      );
      await updateRelationship(requester.id, 'userRequestFriend', true);
    });

    ws?.on('friend_accepted', async (recipient: User) => {
      toast.info(`${recipient.username} accept friend request`);
      await updateRelationship(recipient.id, 'isFriend', true);
    });

    ws?.on('request_cancelled', async (recipient: User) => {
      await updateRelationship(recipient.id, 'meRequestFriend', false);
      await updateRelationship(recipient.id, 'userRequestFriend', false);
    });

    ws?.on('friend_removed', async (oldFriend: User) => {
      await updateRelationship(oldFriend.id, 'isFriend', false);
    });

    ws?.on(
      'user_typing',
      ({
        conversationId,
        user,
      }: {
        conversationId: number;
        user: Omit<User, 'password'>;
      }) => {
        const addTyping = useChatStore.getState().addTyping;
        addTyping(conversationId, user.username);
      }
    );

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
      const { conversationOpened } = useChatStore.getState();
      if (conversationOpened)
        await wConn.mutation.markReadMsg(conversationOpened);
    });

    ws?.on('delete_message', (messageId: number, conversationId: number) => {
      updateInfiniteQuery(
        ['getPaginatedMessages', conversationId],
        (messages) => {
          messages?.pages.forEach((p) => {
            p.data.forEach((m) => {
              if (m.id === messageId) {
                m.text = '';
                m.isDeleted = true;
              }
            });
          });
          return messages;
        }
      );
      updateQuery('getPaginatedConversations', (conversations) => {
        conversations.forEach((c) => {
          if (c.lastMessage?.id === messageId) {
            c.lastMessage.text = '';
            c.lastMessage.isDeleted = true;
          }
        });
        return conversations;
      });
    });

    ws?.on(
      'update_mark_read',
      (userId: number, conversationId: number, lastReadAt: string) => {
        updateQuery('getPaginatedConversations', (conversations) => {
          conversations?.forEach((c) => {
            if (c.id !== conversationId) return;
            c.members.forEach((m) => {
              if (m.user.id === userId) {
                m.lastReadAt = lastReadAt;
              }
            });
          });
          return conversations;
        });
      }
    );

    ws?.on('new_user', (user) => {
      updateQuery('findAll', (users) => (users ? [user, ...users] : users));
    });

    ws?.on('new_conversation', (conversation) => {
      toast.info(
        t('conversation.added', { title: conversation.title } as any),
        { position: 'bottom-left' }
      );
      updateQuery('getPaginatedConversations', (conversations) =>
        conversations ? [conversation, ...conversations] : conversations
      );
    });

    ws?.on('delete_conversation', (conversation: Conversation) => {
      toast.info(
        t('conversation.deleted', { title: conversation.title } as any),
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
              t('conversation.left.adminLeft', {
                title: conversation.title,
              } as any),
              { position: 'bottom-left' }
            );
          }
          if (conversationDeletedReason === 'member_count') {
            toast.info(
              t('conversation.left.minimum', {
                title: conversation.title,
              } as any),
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
      ws?.off('new_friend_request');
      ws?.off('friend_accepted');
      ws?.off('request_cancelled');
      ws?.off('friend_removed');
      ws?.off('user_typing');
      ws?.off('new_message');
      ws?.off('delete_message');
      ws?.off('update_mark_read');
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
