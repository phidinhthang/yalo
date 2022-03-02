import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { MainLayout } from '../../ui/MainLayout';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from './ConversationListController';
import { CreateGroupConversationWidget } from './CreateGroupConversationWidget';

export const ConversationPage = () => {
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();

  React.useEffect(() => {
    if (isDesktopScreen) navigate('/');
  }, [isDesktopScreen, navigate]);

  return (
    <MainLayout>
      <div className='h-full flex flex-col'>
        <div className='w-full p-2 flex justify-end border-b-2'>
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
