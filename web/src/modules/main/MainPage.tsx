import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';

import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useOnClickOutside } from '../../shared-hooks/useOnClickOutside';
import { useWindowSize } from '../../shared-hooks/useWindowSize';
import { useTokenStore } from '../auth/useTokenStore';
import { useWsStore } from '../auth/useWsStore';
import { ChatBox } from '../chat/ChatBox';
import { useChatStore } from '../chat/useChatStore';
import { ConversationList } from './ConversationList';
import { UserItemController } from './UserItemController';
import { Avatar } from '../../ui/Avatar';

export const MainPage = () => {
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const { height } = useWindowSize();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setConversationOpened } = useChatStore();
  const setTokens = useTokenStore((s) => s.setTokens);
  const { ws } = useWsStore();
  const { data: users, isLoading: isUsersLoading } =
    useTypeSafeQuery('findAll');
  const { data: me, isError } = useTypeSafeQuery('me');
  const { data: conversations, isLoading: isConversationsLoading } =
    useTypeSafeQuery('getPaginatedConversations');

  useOnClickOutside(dropdownRef, () => {
    setIsOpenDropdown(false);
  });

  if (!me) return <>loading...</>;
  if (isError) {
    navigate('/login');
  }
  return (
    <div>
      <div className='flex' style={{ height }}>
        <div className='w-60 h-full'>
          <div className='mb-3 px-2 flex'>
            <div
              className='mr-3 hover:cursor-pointer relative'
              onClick={() => setIsOpenDropdown((o) => !o)}
              ref={dropdownRef}
            >
              <Avatar username={me.username} src={me.avatarUrl} size='md' />
              <div
                className={`absolute top-full left-0 z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 ${
                  isOpenDropdown ? '' : 'hidden'
                }`}
              >
                <li className='block py-2 px-4 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setTokens({ accessToken: '', refreshToken: '' });
                      ws?.close();
                      navigate('/login');
                      queryClient.clear();
                      setConversationOpened(null);
                    }}
                    href='#'
                  >
                    logout
                  </a>
                </li>
              </div>
            </div>
            <div>You</div>
          </div>
          <div className='border-2 h-fit'>
            {isUsersLoading ? <div>loading</div> : null}
            {users
              ?.filter((u) => u.id !== me.id)
              .map((u) => (
                <UserItemController user={u} key={u.id} />
              ))}
          </div>
        </div>
        <div className='flex-grow border-2 h-full'>
          <ChatBox />
        </div>
        <div className='w-96 border-2 h-full'>
          {isConversationsLoading ? <div>loading...</div> : null}
          <ConversationList
            conversations={conversations || []}
            onOpened={(id: number) => setConversationOpened(id)}
            me={me!}
          />
        </div>
      </div>
    </div>
  );
};
