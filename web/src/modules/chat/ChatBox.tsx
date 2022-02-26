import { formatDistanceToNow } from 'date-fns';
import { useInView } from 'react-intersection-observer';
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
import { useChatStore } from './useChatStore';
import { Member } from '../../lib/entities';
import React from 'react';

export const ChatBox = () => {
  const { conversationOpened, message, setMessage } = useChatStore();
  const [ref, inView] = useInView();
  const { mutate } = useTypeSafeMutation('createMessage');
  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const {
    data: messages,
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

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const { data: conversations } = useTypeSafeQuery('getPaginatedConversations');
  const conversation = conversations?.find((c) => c.id === conversationOpened);
  const memberMap: Record<number, Member> = {};

  conversation?.members.forEach((m) => {
    memberMap[m.user.id] = m;
  });
  if (!conversationOpened) {
    return <div>not opened</div>;
  }
  if (!conversation) return <>error</>;
  return (
    <div className='flex flex-col h-full p-3'>
      <div className='h-32 overflow-y-auto'>
        {messages?.pages.map((page) =>
          page.data.map((m) => (
            <div key={m.id} className='flex'>
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
        <div ref={ref}>load more</div>
      </div>
      <form
        className='flex'
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
        <input
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          placeholder='type message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
          type='submit'
        >
          send
        </button>
      </form>
    </div>
  );
};
