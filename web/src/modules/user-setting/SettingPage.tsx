import { MainLayout } from '../../ui/MainLayout';
import { TabBar } from './TabBar';

const SettingPage = () => {
  return (
    <MainLayout
      leftPanel={
        <div className='h-full p-4'>
          <TabBar />
        </div>
      }
    >
      <div className='border-l h-full'></div>
    </MainLayout>
  );
};

export default SettingPage;
