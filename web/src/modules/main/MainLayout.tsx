import React from 'react';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useWindowSize } from '../../shared-hooks/useWindowSize';
import { FullHeight } from '../../ui/FullHeight';
import { NavigationBottom } from '../../ui/NavigationBottom';

interface MainLayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  leftPanel = <div />,
  rightPanel = <div />,
  children,
}) => {
  const isDesktopScreen = useIsDesktopScreen();
  return (
    <FullHeight>
      <div className='flex flex-col h-full'>
        <div className='flex flex-grow'>
          {isDesktopScreen ? (
            <div className='w-52 h-full'>{leftPanel}</div>
          ) : (
            <div />
          )}
          <div className='flex-grow h-full'>{children}</div>
          {isDesktopScreen ? (
            <div className='w-80 h-full'>{rightPanel}</div>
          ) : (
            <div />
          )}
        </div>
        {!isDesktopScreen ? <NavigationBottom /> : null}
      </div>
    </FullHeight>
  );
};
