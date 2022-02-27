import React from 'react';
import { SideBar } from '../modules/nav/SideBar';
import { useIsDesktopScreen } from '../shared-hooks/useIsDesktopScreen';

interface MainLayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  leftPanel,
  rightPanel,
  children,
}) => {
  const isDesktopScreen = useIsDesktopScreen();
  return (
    <div className='h-screen max-h-screen flex flex-col'>
      <div className='flex flex-auto'>
        <SideBar />
        {isDesktopScreen && leftPanel ? (
          <div className='w-72 h-full'>{leftPanel}</div>
        ) : null}
        <div className='h-full flex-auto'>{children}</div>
        {isDesktopScreen && rightPanel ? (
          <div className='w-80 h-full'>{rightPanel}</div>
        ) : null}
      </div>
    </div>
  );
};
