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
import { ConversationList } from '../conversation/ConversationList';
import { Avatar } from '../../ui/Avatar';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from '../conversation/ConversationListController';
import { MainLayout } from './MainLayout';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';

export const MainPage = () => {
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setConversationOpened, conversationOpened } = useChatStore();
  const isDesktopScreen = useIsDesktopScreen();
  const setTokens = useTokenStore((s) => s.setTokens);
  const { ws } = useWsStore();
  const { data: me, isError } = useTypeSafeQuery('me');

  useOnClickOutside(dropdownRef, () => {
    setIsOpenDropdown(false);
  });

  React.useEffect(() => {
    if (!conversationOpened && !isDesktopScreen) {
      setTimeout(() => navigate('/conversations'), 200);
    }
  }, [conversationOpened, isDesktopScreen, navigate]);

  if (isError) {
    navigate('/login');
  }
  if (!me) return <>loading...</>;
  return (
    <div>
      <MainLayout
        leftPanel={
          <div className='flex flex-col h-full'>
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
            <div className='border-2 flex-grow'>
              <UserListController />
            </div>
          </div>
        }
        rightPanel={<ConversationListController />}
      >
        <ChatBox />
      </MainLayout>
    </div>
  );
};
