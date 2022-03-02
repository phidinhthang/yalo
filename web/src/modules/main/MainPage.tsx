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
          <div className='flex flex-col h-full'>
            <div className='pb-1 pl-2 pt-4 flex justify-between'>
              <p>Conversations</p>
              <CreateGroupConversationWidget />
            </div>
            <div className='overflow-y-auto'>
              <div>
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
        <div className='h-full border-l-2'>
          <ChatBox />
        </div>
      </MainLayout>
    </div>
  );
};
