import { useNavigate } from 'react-router-dom';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTokenStore } from '../auth/useTokenStore';
import { useWsStore } from '../auth/useWsStore';

export const MainPage = () => {
  const { data, isError, error } = useTypeSafeQuery('me');
  const { data: users } = useTypeSafeQuery('findAll');
  const setTokens = useTokenStore((s) => s.setTokens);
  const { ws } = useWsStore();
  const navigate = useNavigate();
  if (!data || !users) return <></>;
  if (isError) {
    navigate('/login');
  }
  return (
    <div>
      <div>{data.username}</div>
      <button
        onClick={() => {
          setTokens({ accessToken: '', refreshToken: '' });
          ws?.close();
          navigate('/login');
        }}
      >
        logout
      </button>
      <div>
        {users?.map((u) => (
          <div key={u.id}>
            <div>{u.username}</div>
            <div>{u.isOnline ? 'online' : 'offline'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
