import { confirmModal } from '../../lib/confirmModal';
import { useLogout } from '../auth/useLogout';
import { useSelectedTabPanelStore } from './useSelectedTabPanelStore';

export const TabBar = () => {
  const { selectedTab, setSelectedTab } = useSelectedTabPanelStore();
  const logout = useLogout();

  return (
    <div>
      <h4 className='font-semibold text-sm uppercase px-[10px] mb-1'>
        User settings
      </h4>
      <TabBarItem
        active={selectedTab === 'my-account'}
        handleClick={() => {
          setSelectedTab('my-account');
        }}
      >
        My Account
      </TabBarItem>
      <TabBarItem
        active={selectedTab === 'user-profile'}
        handleClick={() => {
          setSelectedTab('user-profile');
        }}
      >
        User Profile
      </TabBarItem>
      <TabBarSeparator />
      <TabBarItem
        active={false}
        handleClick={() => {
          confirmModal('Are you sure to logout ?', () => {
            logout();
          });
        }}
      >
        Log Out
      </TabBarItem>
    </div>
  );
};

interface TabBarItemProps {
  className?: string;
  handleClick?: () => void;
  active?: boolean;
}
const TabBarItem: React.FC<TabBarItemProps> = ({
  className = '',
  active,
  handleClick,
  children,
}) => {
  const cn = `py-[6px] px-[10px] mb-[2px] hover:bg-gray-200 dark:hover:bg-dark-secondary rounded-lg cursor-pointer ${
    active
      ? 'bg-gray-300 dark:bg-dark-secondary hover:bg-gray-300 dark:hover:bg-dark-secondary'
      : ''
  } ${className}`;
  return (
    <div role='tab' tabIndex={0} className={cn} onClick={() => handleClick?.()}>
      {children}
    </div>
  );
};

const TabBarSeparator = () => {
  return (
    <div className='h-[1px] mx-[10px] mt-[8px] mb-[10px] bg-gray-400'></div>
  );
};
