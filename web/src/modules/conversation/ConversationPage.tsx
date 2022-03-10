import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared-hooks/useDarkMode';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { MainLayout } from '../../ui/MainLayout';
import { Switch } from '../../ui/Switch';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from './ConversationListController';
import { CreateGroupConversationWidget } from './CreateGroupConversationWidget';

export const ConversationPage = () => {
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();
  const [enabled, setEnabled] = useDarkMode();
  React.useEffect(() => {
    if (isDesktopScreen) navigate('/');
  }, [isDesktopScreen, navigate]);

  return (
    <MainLayout>
      <div className='h-full flex flex-col'>
        <div className='w-full p-2 flex items-center justify-end gap-2 border-b-2'>
          <Switch
            onClick={(on) => {
              if (typeof setEnabled === 'function') setEnabled(on);
            }}
            initialValue={enabled as boolean}
          />
          <CreateGroupConversationWidget />
        </div>
        <div className='flex-auto overflow-y-auto'>
          <ConversationListController />
          <UserListController />
        </div>
      </div>
    </MainLayout>
  );
};
