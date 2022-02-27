import { useNavigate } from 'react-router-dom';

import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { ChatBox } from '../chat/ChatBox';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from '../conversation/ConversationListController';
import { MainLayout } from '../../ui/MainLayout';

export const MainPage = () => {
  const navigate = useNavigate();
  const { isError } = useTypeSafeQuery('me');

  if (isError) {
    navigate('/login');
  }
  return (
    <div>
      <MainLayout
        leftPanel={
          <div className='flex flex-col flex-auto border-r-2 h-full'>
            <div className='flex-auto'>
              <div>
                <p className='pb-1 pl-2'>Conversations</p>
                <ConversationListController />
              </div>
              <div>
                <p className='pb-1 pl-2'>Users</p>
                <UserListController />
              </div>
            </div>
          </div>
        }
      >
        <ChatBox />
      </MainLayout>
    </div>
  );
};
