import { useNavigate } from 'react-router-dom';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTokenStore } from '../auth/useTokenStore';
import { useWsStore } from '../auth/useWsStore';
import { ChatBox } from '../chat/ChatBox';
import { useChatStore } from '../chat/useChatStore';
import { UserItem } from './UserItem';

export const MainPage = () => {
  const { data: me, isError, error } = useTypeSafeQuery('me');
  const { data: users } = useTypeSafeQuery('findAll');
  const { data: conversations } = useTypeSafeQuery('getPaginatedConversations');
  const { setConversationOpened } = useChatStore();
  const setTokens = useTokenStore((s) => s.setTokens);
  const { ws } = useWsStore();
  const navigate = useNavigate();
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
        }}
      >
        logout
      </button>
      <div className='flex'>
        <div className='flex-grow border-2'>
          {users?.map((u) => (
            <UserItem user={u} />
          ))}
        </div>
        <div className='flex-grow border-2'>
          <ChatBox />
        </div>
        <div className='flex-grow border-2'>
          {conversations?.map((c) => (
            <div onClick={() => setConversationOpened(c.id)}>
              <div>
                {c.members.filter((m) => m.user.id !== me.id)[0].user.username}
              </div>
              <div>
                <div>{c.lastMessage?.text}</div>
                <div>{c.lastMessage?.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
