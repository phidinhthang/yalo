import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { MainLayout } from '../../ui/MainLayout';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from './ConversationListController';

export const ConversationPage = () => {
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();

  React.useEffect(() => {
    if (isDesktopScreen) setTimeout(() => navigate('/'), 200);
  }, [isDesktopScreen]);

  return (
    <MainLayout>
      <ConversationListController />
      <UserListController />
    </MainLayout>
  );
};
