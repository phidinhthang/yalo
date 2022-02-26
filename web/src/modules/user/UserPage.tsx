import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { FullHeight } from '../../ui/FullHeight';
import { NavigationBottom } from '../../ui/NavigationBottom';
import { UserListController } from './UserListController';

export const UserPage = () => {
  const navigate = useNavigate();
  const isDesktopScreen = useIsDesktopScreen();

  React.useEffect(() => {
    if (isDesktopScreen) navigate('/');
  }, [isDesktopScreen]);

  return (
    <FullHeight>
      <div className='h-full flex flex-col'>
        <div className='flex-grow'>
          <UserListController />
        </div>
        <NavigationBottom />
      </div>
    </FullHeight>
  );
};
