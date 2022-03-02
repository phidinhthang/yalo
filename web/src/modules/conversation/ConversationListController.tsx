import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../chat/useChatStore';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { Skeleton } from '../../ui/Skeleton';
import { ConversationItem } from './ConversationItem';

const MainSkeleton = () => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, idx) => (
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

export const ConversationListController = () => {
  const { setConversationOpened } = useChatStore();
  const { data: conversations, isLoading: isConversationsLoading } =
    useTypeSafeQuery('getPaginatedConversations');
  const { data: me, isLoading: isMeLoading, isError } = useTypeSafeQuery('me');
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();

  if (isConversationsLoading || isMeLoading) return <MainSkeleton />;
  if (isError) navigate('/login');

  return (
    <>
      {conversations?.map((c, idx) => (
        <ConversationItem
          key={idx}
          conversation={c}
          onOpened={(id: number) => {
            setConversationOpened(id);
            if (!isDesktopScreen) navigate('/');
          }}
          me={me!}
        />
      ))}
    </>
  );
};
