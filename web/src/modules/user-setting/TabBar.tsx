import { useSelectedTabPanelStore } from './useSelectedTabPanelStore';

export const TabBar = () => {
  const { selectedTab, setSelectedTab } = useSelectedTabPanelStore();
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
  const cn = `py-[6px] px-[10px] mb-[2px] hover:bg-gray-200 rounded-lg cursor-pointer ${
    active ? 'bg-gray-300 hover:bg-gray-300' : ''
  } ${className}`;
  return (
    <div role='tab' tabIndex={0} className={cn} onClick={() => handleClick?.()}>
      {children}
    </div>
  );
};
