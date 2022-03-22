import { Outlet, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../ui/MainLayout';

const AlbumPage = () => {
  return (
    <MainLayout
      leftPanel={
        <div className=''>
          <h3 className='font-semibold text-2xl p-3'>Notification</h3>
        </div>
      }
    >
      <Outlet />
    </MainLayout>
  );
};

export default AlbumPage;
