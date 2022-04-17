import { MainLayout } from '../../ui/MainLayout';
import { MyAccountTab } from './tab-panels/MyAccountTab';
import { UserProfileTab } from './tab-panels/UserProfileTab';
import { TabBar } from './TabBar';
import { useSelectedTabPanelStore } from './useSelectedTabPanelStore';

const SettingPage = () => {
  const selectedTab = useSelectedTabPanelStore((s) => s.selectedTab);
  return (
    <MainLayout
      leftPanel={
        <div className='h-full p-4 dark:bg-dark-primary'>
          <TabBar />
        </div>
      }
    >
      <div className='border-l h-full pt-14 pl-8 pr-16 dark:bg-dark-primary'>
        {selectedTab === 'my-account' ? <MyAccountTab /> : null}
        {selectedTab === 'user-profile' ? <UserProfileTab /> : null}
      </div>
    </MainLayout>
  );
};

export default SettingPage;
