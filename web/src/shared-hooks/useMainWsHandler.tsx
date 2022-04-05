import React, { useContext } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { Message, Conversation, User, Member } from '../lib/api/entities';
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
import { useUpdateRelationship } from '../lib/useUpdateRelationship';
import { useQueryClient } from 'react-query';

export const useMainWsHandler = () => {
  const { ws, setWs } = useWsStore();

  const updateQuery = useTypeSafeUpdateQuery();
  const queryClient = useQueryClient();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const getQuery = useTypeSafeGetQuery();
  const accessToken = useTokenStore().accessToken;
  const wConn = useWrappedConn();
  const { t } = useTypeSafeTranslation();
  const prefetchQuery = useTypeSafePrefetch();

  const updateRelationship = useUpdateRelationship();

  // const updateRelationship = async (
  //   userId: number,
  //   field: 'isFriend' | 'meRequestFriend' | 'userRequestFriend',
  //   value: boolean
  // ) => {
  //   await prefetchQuery(['getUserInfo', userId!]);
  //   updateQuery(['getUserInfo', userId!], (user) => {
  //     if (user) {
  //       user[field] = value;
  //     }
  //     return user;
  //   });
  // };

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
      const conversations = getQuery('getPaginatedConversations');
      if (conversations) {
        updateQuery('getPaginatedConversations', (conversations) => {
          if (!conversations) return conversations;
          conversations
            .filter((c) => c.type === 'private')
            .forEach((c) => {
              if (c.partner?.id === userId) {
                c.partner.isOnline = true;
              }
            });
          return conversations;
        });
      }
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
      const conversations = getQuery('getPaginatedConversations');
      if (conversations) {
        updateQuery('getPaginatedConversations', (conversations) => {
          if (!conversations) return conversations;
          conversations
            .filter((c) => c.type === 'private')
            .forEach((c) => {
              if (c.partner?.id === userId) {
                c.partner.isOnline = false;
              }
            });
          return conversations;
        });
      }
    });

    ws?.on('new_friend_request', async (requester: Omit<User, 'password'>) => {
      toast.info(
        <div>
          {requester.username} send a friend request <Button>Accept</Button>
        </div>,
        { position: 'bottom-left' }
      );
      updateRelationship(
        requester.id,
        { userRequestFriend: true, isFriend: false },
        {
          ...requester,
          userRequestFriend: true,
          isFriend: false,
          meRequestFriend: false,
        }
      );
    });

    ws?.on('friend_accepted', async (recipient: User) => {
      toast.info(`${recipient.username} accept friend request`, {
        position: 'bottom-left',
      });
      updateRelationship(
        recipient.id,
        { isFriend: true, meRequestFriend: false, userRequestFriend: false },
        {
          ...recipient,
          userRequestFriend: false,
          meRequestFriend: false,
          isFriend: true,
        }
      );
    });

    ws?.on('request_cancelled', async (recipient: User) => {
      const defaultCache = {
        ...recipient,
        isFriend: false,
        userRequestFriend: false,
        meRequestFriend: false,
      };
      updateRelationship(
        recipient.id,
        { isFriend: false, userRequestFriend: false, meRequestFriend: false },
        defaultCache
      );
    });

    ws?.on('friend_removed', async (oldFriend: User) => {
      updateRelationship(
        oldFriend.id,
        { isFriend: false, meRequestFriend: false, userRequestFriend: false },
        {
          ...oldFriend,
          meRequestFriend: false,
          isFriend: false,
          userRequestFriend: false,
        }
      );
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
        const typingId = Math.random().toString(16).slice(0, 32);
        updateQuery(['getConversation', conversationId], (conversation) => {
          // @ts-ignore
          if (!conversation.typingMembers) {
            // @ts-ignore
            conversation.typingMembers = [{ typingId, user }];
          } else {
            // @ts-ignore
            conversation.typingMembers?.push({ typingId, user });
          }
          return conversation;
        });
        setTimeout(() => {
          updateQuery(['getConversation', conversationId], (conversation) => {
            // @ts-ignore
            conversation.typingMembers = conversation?.typingMembers?.filter(
              ({ typingId: tId }: any) => tId !== typingId
            );
            return conversation;
          });
        }, 2000);
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
        const conversation = getQuery(['getConversation', conversationId]);
        if (!conversation) return;
        updateQuery(['getConversation', conversationId], (c) => {
          c.members.forEach((m) => {
            if (m.user.id === userId) {
              m.lastReadAt = lastReadAt;
            }
          });
          return c;
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
      const conversations = getQuery('getPaginatedConversations');
      if (!conversations) return;
      updateQuery('getPaginatedConversations', (conversations) =>
        conversations ? [conversation, ...conversations] : conversations
      );
    });

    ws?.on('conversation_added', (conversation: Conversation) => {
      const conversations = getQuery('getPaginatedConversations');
      if (!conversations) return;
      updateQuery('getPaginatedConversations', (conversations) => {
        conversations.unshift(conversation);
        return conversations;
      });
    });

    ws?.on('new_members', (conversationId: number, newMembers: Member[]) => {
      const conversation = getQuery(['getConversation', conversationId]);
      if (!conversation) return;
      updateQuery(['getConversation', conversationId], (conversation) => {
        conversation.members.unshift(...newMembers);
        return conversation;
      });
    });

    ws?.on('you_have_been_kicked', (conversation: Conversation) => {
      console.log('you_have_been_kicked', conversation);
      queryClient.removeQueries(['getConversation', conversation.id], {
        exact: true,
      });
      const conversations = getQuery('getPaginatedConversations');
      if (conversations) {
        updateQuery('getPaginatedConversations', (conversations) => {
          return conversations?.filter((c) => c.id !== conversation.id);
        });
      }
    });

    ws?.on('delete_conversation', (conversation: Conversation) => {
      toast.info(
        t('conversation.deleted', { title: conversation.title } as any),
        { position: 'bottom-left' }
      );
      const conversations = getQuery('getPaginatedConversations');
      if (!conversations) return;
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
        const c = getQuery(['getConversation', conversation.id]);
        if (c && !conversationDeletedReason) {
          updateQuery(['getConversation', conversation.id], (c) => {
            c.members = c.members.filter((m) => m.user.id !== userId);
            return c;
          });
        }
        const conversations = getQuery('getPaginatedConversations');
        if (conversations && conversationDeletedReason) {
          updateQuery('getPaginatedConversations', (conversations) => {
            return conversations?.filter((c) => c.id !== conversation.id);
          });
        }
      }
    );

    ws?.on('new_notification', () => {
      queryClient.invalidateQueries('getPaginatedNotifications');
    });

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
      ws?.off('conversation_added');
      ws?.off('new_members');
      ws?.off('you_have_been_kicked');
      ws?.off('new_notification');
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
