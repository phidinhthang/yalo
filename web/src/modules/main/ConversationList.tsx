import React from 'react';
import { Conversation } from '../../lib/entities';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useChatStore } from '../chat/useChatStore';

export const ConversationList = () => {
  const { data: me } = useTypeSafeQuery('me');
  const { setConversationOpened } = useChatStore();
  const { data: conversations, isLoading } = useTypeSafeQuery(
    'getPaginatedConversations'
  );
  console.log('conversation list ', conversations);
  if (isLoading) return <div>loading...</div>;
  return (
    <>
      {[...conversations!].map((c) => (
        <div key={c.id} onClick={() => setConversationOpened(c.id)}>
          <div>
            {
              c.members.filter(
                (m) => m.user?.id !== undefined && m.user.id !== me!.id
              )[0].user.username
            }
          </div>
          <div>
            <div>{c.lastMessage?.text}</div>
            <div>{c.lastMessage?.createdAt}</div>
          </div>
        </div>
      ))}
    </>
  );
};
