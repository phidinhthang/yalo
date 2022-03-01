import React from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useOnClickOutside } from '../../shared-hooks/useOnClickOutside';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../ui/Avatar';
import { useTokenStore } from '../auth/useTokenStore';
import { useChatStore } from '../chat/useChatStore';
import { useWsStore } from '../auth/useWsStore';
import { Modal } from '../../ui/Modal';

export const AvatarMenu = () => {
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const queryClient = useQueryClient();
  const { setConversationOpened, conversationOpened } = useChatStore();
  const setTokens = useTokenStore((s) => s.setTokens);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();
  const { data: me } = useTypeSafeQuery('me');
  const { ws } = useWsStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useOnClickOutside(dropdownRef, () => {
    setIsOpenDropdown(false);
  });

  const logout = () => {
    setTokens({ accessToken: '', refreshToken: '' });
    ws?.close();
    navigate('/login');
    queryClient.clear();
    setConversationOpened(null);
  };

  React.useEffect(() => {
    if (!conversationOpened && !isDesktopScreen) {
      setTimeout(() => navigate('/conversations'), 200);
    }
  }, [conversationOpened, isDesktopScreen, navigate]);
  return (
    <>
      <div
        className='hover:cursor-pointer relative'
        onClick={() => setIsOpenDropdown((o) => !o)}
        ref={dropdownRef}
      >
        <Avatar username={me?.username} src={me?.avatarUrl} size='md' />
        <div
          className={`absolute top-full left-0 z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 ${
            isOpenDropdown ? '' : 'hidden'
          }`}
        >
          <li className='block py-2 px-4 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>
            <a
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              href='#'
            >
              logout
            </a>
          </li>
        </div>
      </div>
      <Modal
        title='Logout'
        isOpen={isModalOpen}
        onRequestClose={(e) => {
          setIsModalOpen(false);
        }}
        footer={<button onClick={(e) => logout()}>ok</button>}
      >
        Are you sure to logout ?
      </Modal>
    </>
  );
};
