import { useDarkMode } from '../../shared-hooks/useDarkMode';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { MainLayout } from '../../ui/MainLayout';
import { Switch } from '../../ui/Switch';
import { CreateGroupConversationWidget } from '../conversation/CreateGroupConversationWidget';
import { UserItem } from '../user/UserItem';
import { FriendMainPanel } from './main-panel';
import { SplittedLeftPanelWrapper } from './SplittedLeftPanelWrapper';
import { useMainPanelOpenStore } from './useMainPanelOpenStore';

export const FriendPage = () => {
  const { t } = useTypeSafeTranslation();
  const [enabled, setEnabled] = useDarkMode();
  const { data: friends } = useTypeSafeQuery('getPaginatedFriends');
  const { open, setOpen } = useMainPanelOpenStore();
  return (
    <MainLayout
      leftPanel={
        <div className='flex flex-col h-full dark:bg-dark-500'>
          <div className='pb-1 pl-2 pt-4 flex justify-between'>
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
                  onClick={() => setOpen('friend-search')}
                >
                  <div className='w-[52px] h-[52px] rounded-full'>
                    <img
                      src='/img/new-friend.png'
                      className='w-[52px] h-[52px] object-cover'
                    />
                  </div>
                  <p>Search friend</p>
                </div>
              </SplittedLeftPanelWrapper>
              <SplittedLeftPanelWrapper label='Friend request' collapsible>
                <div
                  className={`flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-300 hover:cursor-pointer ${
                    open === 'incoming-friend-request'
                      ? 'bg-blue-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-700'
                      : ''
                  }`}
                  onClick={() => setOpen('incoming-friend-request')}
                >
                  <div className='w-[52px] h-[52px] rounded-full'>
                    <img
                      src='/img/new-friend.png'
                      className='w-[52px] h-[52px] object-cover'
                    />
                  </div>
                  <p>Incoming</p>
                </div>
                <div
                  className={`flex gap-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-300 hover:cursor-pointer ${
                    open === 'outgoing-friend-request'
                      ? 'bg-blue-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-700'
                      : ''
                  }`}
                  onClick={() => setOpen('outgoing-friend-request')}
                >
                  <div className='w-[52px] h-[52px] rounded-full'>
                    <img
                      src='/img/new-friend.png'
                      className='w-[52px] h-[52px] object-cover'
                    />
                  </div>
                  <p>Outgoing</p>
                </div>
              </SplittedLeftPanelWrapper>
            </div>
            <div className='p-2'>
              {!friends?.length ? <p className='p-2'>No friends</p> : null}
              {friends?.map((f) => (
                <UserItem user={f} onClick={() => {}} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className='h-full border-l-2 dark:border-gray-700'>
        <FriendMainPanel />
      </div>
    </MainLayout>
  );
};
