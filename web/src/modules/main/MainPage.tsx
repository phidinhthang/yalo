import { useNavigate } from 'react-router-dom';

import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { ChatBox } from '../chat/ChatBox';
import { UserListController } from '../user/UserListController';
import { ConversationListController } from '../conversation/ConversationListController';
import { MainLayout } from '../../ui/MainLayout';
import { CreateGroupConversationWidget } from '../conversation/CreateGroupConversationWidget';

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
          <div className='flex flex-col flex-auto h-full'>
            <div className='flex-auto'>
              <div>
                <div className='pb-1 pl-2 flex justify-between'>
                  <p>Conversations</p>
                  <CreateGroupConversationWidget />
                </div>
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
