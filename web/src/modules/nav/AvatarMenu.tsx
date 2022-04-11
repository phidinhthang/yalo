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
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { testId } from '../../utils/testId';
import { confirmModal } from '../../lib/confirmModal';
import { useLogout } from '../auth/useLogout';

export const AvatarMenu = () => {
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const { setConversationOpened, conversationOpened } = useChatStore();
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();
  const { data: me } = useTypeSafeQuery('me');
  const { mutate: devDeleteAccount } = useTypeSafeMutation('deleteAccount');
  const { t } = useTypeSafeTranslation();
  const location = useLocation();
  const logout = useLogout();

  useOnClickOutside(dropdownRef, () => {
    setIsOpenDropdown(false);
  });

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
                confirmModal(t('common.logout.confirm'), () => {
                  logout();
                });
              }}
              href='#'
              {...testId('logout')}
            >
              {t('common.logout.label')}
            </a>
          </li>
        </div>
      </div>
    </>
  );
};
