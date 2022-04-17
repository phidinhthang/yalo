import React from 'react';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { User } from '../../lib/api/entities';
import { UserItem } from './UserItem';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useChatStore } from '../chat/useChatStore';

export const UserItemController = ({
  user,
}: {
  user: Omit<User, 'password'>;
}) => {
  const [enabled, setEnabled] = React.useState(false);
  const { setConversationOpened } = useChatStore();
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();
  const updateQuery = useTypeSafeUpdateQuery();
  const { data: conversation } = useTypeSafeQuery(
    ['getPrivateConversation', user.id],
    {
      enabled,
    },
    [{ id: user.id }]
  );
  const { data: me } = useTypeSafeQuery('me');

  React.useEffect(() => {
    if (!enabled || !conversation) return;
    updateQuery('getPaginatedConversations', (conversations) => {
      if (!conversations.find((c) => c.id === conversation?.id)) {
        conversation.partner = user;
        return [conversation, ...conversations];
      }
      return conversations;
    });

    updateQuery(['getConversation', conversation.id], () => {
      return conversation;
    });

    if (!isDesktopScreen) navigate('/');
    setConversationOpened(conversation.id);
  }, [enabled, conversation, updateQuery, isDesktopScreen, navigate]);

  return (
    <UserItem
      user={user}
      onClick={() => {
        if (me?.id === user.id) return;
        setEnabled(true);
      }}
      className='p-2 hover:bg-gray-100 dark:hover:bg-dark-secondary hover:cursor-pointer'
    />
  );
};
