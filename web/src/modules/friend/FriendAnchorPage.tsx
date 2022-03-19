import React from 'react';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { FriendAnchorController } from './FriendAnchorController';
import { useMainPanelOpenStore } from './useMainPanelOpenStore';
import { useNavigate } from 'react-router-dom';

const FriendAnchorPage = () => {
  const isDesktopScreen = useIsDesktopScreen();
  const { open, setOpen } = useMainPanelOpenStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    setOpen(null);
  }, []);

  React.useEffect(() => {
    if (!isDesktopScreen) return;
    if (!open) setOpen('incoming-friend-request');
    navigate('/f');
  }, [isDesktopScreen, navigate]);

  return <FriendAnchorController />;
};

export default FriendAnchorPage;
