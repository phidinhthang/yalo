import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';

export const UserItem = ({
  user,
}: {
  user: { id: number; username: string; isOnline: boolean };
}) => {
  const { refetch } = useTypeSafeQuery(
    ['getPrivateConversation', user.id],
    {
      enabled: false,
    },
    [{ id: user.id }]
  );
  const updateQuery = useTypeSafeUpdateQuery();
  return (
    <div
      onClick={() => {
        refetch().then(({ data: conversation }) => {
          updateQuery('getPaginatedConversations', (conversations) => {
            if (!conversations.find((c) => c.id === conversation?.id)) {
              conversations.push(conversation!);
            }
            return conversations;
          });
        });
      }}
    >
      <div>{user.username}</div>
      <div>{user.isOnline}</div>
    </div>
  );
};
