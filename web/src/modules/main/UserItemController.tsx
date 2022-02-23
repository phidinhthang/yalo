import React from 'react';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { User } from '../../lib/entities';
import { UserItem } from './UserItem';

export const UserItemController = ({
  user,
}: {
  user: Omit<User, 'password'>;
}) => {
  const [enabled, setEnabled] = React.useState(false);
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
        return [conversation!, ...conversations];
      }
      return conversations;
    });
  }, [enabled, conversation, updateQuery]);

  return (
    <UserItem
      user={user}
      onClick={() => {
        if (me?.id === user.id) return;
        setEnabled(true);
      }}
      className='p-2 hover:bg-gray-100 hover:cursor-pointer'
    />
  );
};
