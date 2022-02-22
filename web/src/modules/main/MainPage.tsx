import { useNavigate } from 'react-router-dom';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { useTokenStore } from '../auth/useTokenStore';
import { useWsStore } from '../auth/useWsStore';
import { ChatBox } from '../chat/ChatBox';
import { useChatStore } from '../chat/useChatStore';
import { ConversationList } from './ConversationList';
import { UserItem } from './UserItem';
import { useQueryClient } from 'react-query';

export const MainPage = () => {
  const { data: me, isError, error } = useTypeSafeQuery('me');
  const { data: users } = useTypeSafeQuery('findAll');
  const { setConversationOpened } = useChatStore();
  const setTokens = useTokenStore((s) => s.setTokens);
  const { ws } = useWsStore();
  const navigate = useNavigate();
  const updateQuery = useTypeSafeUpdateQuery();
  const queryClient = useQueryClient();
  if (!me || !users) return <></>;
  if (isError) {
    navigate('/login');
  }
  return (
    <div>
      <div>{me.username}</div>
      <button
        onClick={() => {
          setTokens({ accessToken: '', refreshToken: '' });
          ws?.close();
          navigate('/login');
          queryClient.clear();
          setConversationOpened(null);
        }}
      >
        logout
      </button>
      <div className='flex'>
        <div className='flex-grow border-2'>
          {users?.map((u) => (
            <UserItem user={u} updateQuery={updateQuery} />
          ))}
        </div>
        <div className='flex-grow border-2'>
          <ChatBox />
        </div>
        <div className='flex-grow border-2'>
          <ConversationList />
        </div>
      </div>
    </div>
  );
};
