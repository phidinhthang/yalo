import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { MainLayout } from '../../ui/MainLayout';
import { FriendAnchorController } from './FriendAnchorController';
import { FriendMainPanel } from './main-panel';
import { useMainPanelOpenStore } from './useMainPanelOpenStore';

const FriendPage = () => {
  const isDesktopScreen = useIsDesktopScreen();
  const { open, setOpen } = useMainPanelOpenStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (open) return;
    if (isDesktopScreen) return setOpen('incoming-friend-request');
    navigate('/@f');
  }, [isDesktopScreen, navigate, open]);

  return (
    <MainLayout leftPanel={<FriendAnchorController />}>
      <div className='h-full border-l-2 dark:border-gray-700 dark:bg-dark-primary'>
        <FriendMainPanel />
      </div>
    </MainLayout>
  );
};

export default FriendPage;
