import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../chat/useChatStore';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { ConversationList } from './ConversationList';
import { ChatBox } from '../chat/ChatBox';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import React from 'react';

export const ConversationListController = () => {
  const { setConversationOpened, conversationOpened } = useChatStore();
  const { data: conversations, isLoading: isConversationsLoading } =
    useTypeSafeQuery('getPaginatedConversations');
  const { data: me, isLoading: isMeLoading, isError } = useTypeSafeQuery('me');
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();

  if (isConversationsLoading || isMeLoading) return <div>loading...</div>;
  if (isError) navigate('/login');

  return (
    <ConversationList
      conversations={conversations || []}
      onOpened={(id: number) => {
        setConversationOpened(id);
        if (!isDesktopScreen) navigate('/');
      }}
      me={me!}
    />
  );
};
