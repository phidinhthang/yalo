import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { UserItemController } from './UserItemController';

export const UserListController = () => {
  const { data: users, isLoading } = useTypeSafeQuery('findAll');
  const { data: me } = useTypeSafeQuery('me');
  if (isLoading) return <div>loading...</div>;

  return (
    <>
      {users
        ?.filter((u) => u.id !== me?.id)
        .map((u) => (
          <UserItemController key={u.id} user={u} />
        ))}
    </>
  );
};
