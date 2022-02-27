import { useMemo } from 'react';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Skeleton } from '../../ui/Skeleton';
import { UserItemController } from './UserItemController';

const MainSkeleton = () => {
  return (
    <>
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className='px-2 flex gap-2 mb-2'>
          <Skeleton circle className='w-12 h-12 rounded-full' />
          <div className='flex-1'>
            <Skeleton className='h-6 w-2/5 mb-1' />
            <Skeleton className='h-6 w-4/5' />
          </div>
        </div>
      ))}
    </>
  );
};

export const UserListController = () => {
  const { data: users, isLoading } = useTypeSafeQuery('findAll');
  const { data: conversations } = useTypeSafeQuery('getPaginatedConversations');
  const { data: me } = useTypeSafeQuery('me');

  const hiddenUserMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    conversations
      ?.filter((c) => c.type === 'private')
      .forEach((c) => {
        c.members
          .filter((m) => m.user.id !== me?.id)
          .forEach((m) => {
            map[m.user.id] = true;
          });
      });

    return map;
  }, [conversations, me]);

  if (isLoading) return <MainSkeleton />;

  return (
    <>
      {users
        ?.filter((u) => u.id !== me?.id && !hiddenUserMap[u.id])
        .map((u) => (
          <UserItemController key={u.id} user={u} />
        ))}
    </>
  );
};
