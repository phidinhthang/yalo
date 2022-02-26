import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { FullHeight } from '../../ui/FullHeight';
import { NavigationBottom } from '../../ui/NavigationBottom';
import { ConversationListController } from './ConversationListController';

export const ConversationPage = () => {
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();

  React.useEffect(() => {
    if (isDesktopScreen) setTimeout(() => navigate('/'), 200);
  }, [isDesktopScreen]);

  return (
    <FullHeight>
      <div className='h-full flex flex-col'>
        <div className='flex-grow'>
          <ConversationListController />
        </div>
        {!isDesktopScreen ? <NavigationBottom /> : null}
      </div>
    </FullHeight>
  );
};
