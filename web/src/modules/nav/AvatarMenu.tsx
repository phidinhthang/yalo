import React from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useOnClickOutside } from '../../shared-hooks/useOnClickOutside';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../ui/Avatar';
import { useTokenStore } from '../auth/useTokenStore';
import { useChatStore } from '../chat/useChatStore';
import { useWsStore } from '../auth/useWsStore';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { testId } from '../../utils/testId';

export const AvatarMenu = () => {
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const queryClient = useQueryClient();
  const { setConversationOpened, conversationOpened } = useChatStore();
  const setTokens = useTokenStore((s) => s.setTokens);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();
  const { data: me } = useTypeSafeQuery('me');
  const { mutate: devDeleteAccount } = useTypeSafeMutation('deleteAccount');
  const { ws } = useWsStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { t } = useTypeSafeTranslation();
  const location = useLocation();

  useOnClickOutside(dropdownRef, () => {
    setIsOpenDropdown(false);
  });

  const logout = () => {
    setTokens({ accessToken: '', refreshToken: '' });
    ws?.close();
    navigate('/login');
    queryClient.clear();
    setConversationOpened(null);
    toast.success(t('common.logout.success'));
  };

  React.useEffect(() => {
    if (!conversationOpened && !isDesktopScreen && location.pathname === '/') {
      setTimeout(() => navigate('/conversations'), 200);
    }
  }, [conversationOpened, isDesktopScreen, navigate, location]);
  return (
    <>
      <div
        className='hover:cursor-pointer relative'
        onClick={() => setIsOpenDropdown((o) => !o)}
        ref={dropdownRef}
        {...testId('avatar-menu')}
      >
        <Avatar username={me?.username} src={me?.avatarUrl} size='md' />
        <div
          className={`absolute top-full left-0 z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 ${
            isOpenDropdown ? '' : 'hidden'
          }`}
        >
          {import.meta.env.VITE_ENV === 'development' ? (
            <li className='block py-2 px-4 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>
              <a
                className='block'
                onClick={(e) => {
                  e.preventDefault();
                  devDeleteAccount([], {
                    onSuccess: (isSuccess) => {
                      if (isSuccess) {
                        logout();
                      }
                    },
                  });
                }}
                href='#'
                {...testId('delete-account')}
              >
                delete account
              </a>
            </li>
          ) : null}
          <li className='block py-2 px-4 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>
            <a
              className='block'
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              href='#'
              {...testId('logout')}
            >
              {t('common.logout.label')}
            </a>
          </li>
        </div>
      </div>
      <Modal
        title={t('common.logout.label')}
        isOpen={isModalOpen}
        onRequestClose={(e) => {
          setIsModalOpen(false);
        }}
        footer={
          <div className='flex w-full'>
            <div className='flex-grow'></div>
            <Button
              onClick={(e) => logout()}
              className=''
              {...testId('modal-confirm')}
            >
              ok
            </Button>
          </div>
        }
      >
        {t('common.logout.confirm')}
      </Modal>
    </>
  );
};
