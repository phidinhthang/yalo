import { formatDistanceToNow } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../ui/Avatar';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import {
  useTypeSafeInfiniteQuery,
  useTypeSafeQuery,
} from '../../shared-hooks/useTypeSafeQuery';
import {
  useTypeSafeUpdateQuery,
  useTypeSafeUpdateInfiniteQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useChatStore } from './useChatStore';
import { Member } from '../../lib/entities';
import React from 'react';
import { Skeleton } from '../../ui/Skeleton';
import { randomNumber } from '../../utils/randomNumber';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';

const MainSkeleton = () => {
  const genHeight = () => randomNumber(3, 8) * 12;
  const genWidth = () => randomNumber(8, 24) * 18;
  return (
    <div className='h-screen overflow-y-auto'>
      {Array.from({ length: randomNumber(8, 12) }).map((_, idx) => {
        const isLeft = randomNumber(0, 1);
        return (
          <div
            key={idx}
            className={`px-2 flex gap-2 mb-2 ${
              isLeft ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <Skeleton circle className='w-14 h-14 rounded-full' />
            <div
              className={`flex flex-col flex-1 ${
                isLeft ? 'items-start' : 'items-end'
              }`}
            >
              <Skeleton className='h-7 w-36 mb-1' />
              <Skeleton
                style={{
                  height: genHeight(),
                  width: genWidth(),
                  maxWidth: '100%',
                }}
                className='px-2'
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ChatBox = () => {
  const { conversationOpened, message, setMessage } = useChatStore();
  const [ref, inView] = useInView();
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();
  const { mutate } = useTypeSafeMutation('createMessage');
  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { t } = useTypeSafeTranslation();
  const {
    data: messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useTypeSafeInfiniteQuery(
    ['getPaginatedMessages', conversationOpened!],
    {
      enabled: !!conversationOpened,
      getNextPageParam: (lastPage) => {
        if (!lastPage.nextCursor) return undefined;
        return lastPage;
      },
    },
    [{ conversationId: conversationOpened! }]
  );

  const endRef = React.useRef<HTMLDivElement>(null);

  if (inView && hasNextPage) {
    fetchNextPage();
  }

  React.useEffect(() => {
    if (!isLoading) {
      endRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [endRef.current, conversationOpened, isLoading]);

  const { data: conversations } = useTypeSafeQuery('getPaginatedConversations');
  const conversation = conversations?.find((c) => c.id === conversationOpened);
  const memberMap: Record<number, Member> = {};

  conversation?.members.forEach((m) => {
    memberMap[m.user.id] = m;
  });
  if (!conversationOpened && !isDesktopScreen) {
    navigate('/conversations');
  }

  if (!conversationOpened) {
    return (
      <div className='h-full flex items-center justify-center text-center'>
        <div>
          <h2 className='text-2xl mb-3'>
            Welcome to <b>yalo!</b>
          </h2>
          <p className='w-full px-2 max-w-[480px] mx-auto'>
            Explore the best features to support your work and allow you to chat
            with your friends and family. All are optimized for your computer!
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) return <>error</>;

  if (isLoading) {
    return <MainSkeleton />;
  }

  return (
    <div className='h-screen relative flex flex-col border-l-2'>
      <div className='flex-auto overflow-y-auto flex flex-col-reverse px-2'>
        <div ref={endRef} style={{ float: 'left', clear: 'both' }}></div>
        {messages?.pages.map((page) =>
          page.data.map((m) => (
            <div key={m.id} className='flex my-2'>
              <div className='mr-3'>
                <Avatar
                  size='sm'
                  src={memberMap[m.creator].user.avatarUrl}
                  username={memberMap[m.creator].user.username}
                />
              </div>
              <div>
                <p>{m.text}</p>
                <div className='flex'>
                  <div className='flex-grow'></div>
                  <p className='text-sm italic text-gray-500'>
                    {formatDistanceToNow(new Date(m.createdAt))}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        {hasNextPage ? <div ref={ref} className='pb-1'></div> : null}
      </div>
      <form
        className='flex mb-2'
        onSubmit={(e) => {
          e.preventDefault();
          mutate([{ conversationId: conversationOpened, text: message }], {
            onSuccess: (data) => {
              if (!('id' in data)) return;
              updateInfiniteQuery(
                ['getPaginatedMessages', conversationOpened],
                (messages) => {
                  if (!messages) return messages;
                  messages.pages[0].data.unshift(data);
                  return messages;
                }
              );
              updateQuery('getPaginatedConversations', (conversations) => {
                conversations
                  ?.filter((c) => c.id === data.conversation)
                  .map((c) => {
                    c.lastMessage = data;
                    return c;
                  });

                return conversations;
              });
              setMessage('');
            },
          });
        }}
      >
        <Input
          placeholder='type message...'
          size='lg'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type='submit'>{t('pages.main.sendMsg')}</Button>
      </form>
    </div>
  );
};
