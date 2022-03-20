import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared-hooks/useDarkMode';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { Switch } from '../../ui/Switch';
import { CreateGroupConversationWidget } from '../conversation/CreateGroupConversationWidget';
import { UserItem } from '../user/UserItem';
import { SplittedLeftPanelWrapper } from './SplittedLeftPanelWrapper';
import { useMainPanelOpenStore } from './useMainPanelOpenStore';

export const FriendAnchorController = () => {
  const { open, setOpen } = useMainPanelOpenStore();
  const [enabled, setEnabled] = useDarkMode();
  const { data: friends } = useTypeSafeQuery('getPaginatedFriends');
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();
  const { t } = useTypeSafeTranslation();

  const navigateToMainPanelOnMobile = () => {
    if (!isDesktopScreen) {
      navigate('/f');
    }
  };

  return (
    <div className='flex flex-col h-full dark:bg-dark-500'>
      <div className='pb-1 pl-2 pt-4 flex justify-between'>
        <h3>{t('friend.friends')}</h3>
        <div className='flex gap-1 items-center ml-auto'>
          <Switch
            onClick={(on) => {
              if (typeof setEnabled === 'function') setEnabled(on);
            }}
            initialValue={enabled as boolean}
          />
          <CreateGroupConversationWidget />
        </div>
      </div>
      <div className='overflow-y-auto'>
        <div>
          <SplittedLeftPanelWrapper>
            <div
              className={`flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-300 hover:cursor-pointer ${
                open === 'friend-search'
                  ? 'bg-blue-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-700'
                  : ''
              }`}
              onClick={() => {
                setOpen('friend-search');
                navigateToMainPanelOnMobile();
              }}
            >
              <div className='w-[52px] h-[52px] rounded-full'>
                <img
                  src='/img/new-friend.png'
                  className='w-[52px] h-[52px] object-cover'
                />
              </div>
              <p>{t('friend.search')}</p>
            </div>
          </SplittedLeftPanelWrapper>
          <SplittedLeftPanelWrapper
            label={t('friend.requests.label')}
            collapsible
          >
            <div
              className={`flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-300 hover:cursor-pointer ${
                open === 'incoming-friend-request'
                  ? 'bg-blue-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-700'
                  : ''
              }`}
              onClick={() => {
                setOpen('incoming-friend-request');
                navigateToMainPanelOnMobile();
              }}
            >
              <div className='w-[52px] h-[52px] rounded-full'>
                <img
                  src='/img/new-friend.png'
                  className='w-[52px] h-[52px] object-cover'
                />
              </div>
              <p>{t('friend.requests.incoming')}</p>
            </div>
            <div
              className={`flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-300 hover:cursor-pointer ${
                open === 'outgoing-friend-request'
                  ? 'bg-blue-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-700'
                  : ''
              }`}
              onClick={() => {
                setOpen('outgoing-friend-request');
                navigateToMainPanelOnMobile();
              }}
            >
              <div className='w-[52px] h-[52px] rounded-full'>
                <img
                  src='/img/new-friend.png'
                  className='w-[52px] h-[52px] object-cover'
                />
              </div>
              <p>{t('friend.requests.outgoing')}</p>
            </div>
          </SplittedLeftPanelWrapper>
        </div>
        <div className='p-2'>
          {!friends?.length ? (
            <p className='p-2'>{t('friend.noFriends')}</p>
          ) : null}
          {friends?.map((f) => (
            <UserItem user={f} onClick={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
};
