import React from 'react';
import { useQueryClient } from 'react-query';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';

export const UserItem = ({
  user,
  updateQuery,
}: {
  user: { id: number; username: string; isOnline: boolean };
  updateQuery: ReturnType<typeof useTypeSafeUpdateQuery>;
}) => {
  const [enabled, setEnabled] = React.useState(false);
  const { refetch, data: conversation } = useTypeSafeQuery(
    ['getPrivateConversation', user.id],
    {
      enabled,
    },
    [{ id: user.id }]
  );
  React.useEffect(() => {
    if (enabled && conversation) {
      console.log('conversation found', conversation);
      updateQuery('getPaginatedConversations', (conversations) => {
        if (!conversations.find((c) => c.id === conversation?.id)) {
          console.log('not in');
          return [conversation!, ...conversations];
        }
        console.log('list ', conversations);
        return conversations;
      });
    }
  }, [enabled, conversation, updateQuery]);
  return (
    <div
      onClick={() => {
        setEnabled(true);
      }}
    >
      <div>{user.username}</div>
      <div>{user.isOnline ? 'online' : 'offline'}</div>
    </div>
  );
};
