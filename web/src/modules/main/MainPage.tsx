import { useNavigate } from 'react-router-dom';

import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useDarkMode } from '../../shared-hooks/useDarkMode';
import { ChatBox } from '../chat/ChatBox';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from '../conversation/ConversationListController';
import { MainLayout } from '../../ui/MainLayout';
import { Switch } from '../../ui/Switch';
import { CreateGroupConversationWidget } from '../conversation/CreateGroupConversationWidget';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';

const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTypeSafeTranslation();
  const { isError } = useTypeSafeQuery('me');
  const [enabled, setEnabled] = useDarkMode();

  if (isError) {
    navigate('/login');
  }
  return (
    <div>
      <MainLayout
        leftPanel={
          <div className='flex flex-col h-full dark:bg-dark-primary'>
            <div className='pb-1 pl-2 pt-4 flex justify-between'>
              <p>{t('common.conversations')}</p>
              <div className='flex gap-1 items-center'>
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
                <ConversationListController />
              </div>
              <div>
                <p className='pb-1 pl-2'>{t('common.users')}</p>
                <UserListController />
              </div>
            </div>
          </div>
        }
      >
        <div className='h-full border-l dark:border-gray-700'>
          <ChatBox />
        </div>
      </MainLayout>
    </div>
  );
};

export default MainPage;
