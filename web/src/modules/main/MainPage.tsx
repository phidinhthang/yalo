import { useNavigate } from 'react-router-dom';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useRefreshToken } from '../auth/useRefreshToken';
import { useTokenStore } from '../auth/useTokenStore';

export const MainPage = () => {
  const { isLoading } = useRefreshToken();
  const { data } = useTypeSafeQuery('me');
  const setTokens = useTokenStore((s) => s.setTokens);
  const navigate = useNavigate();
  if (isLoading || !data) return <></>;
  return (
    <div>
      <div>{data.username}</div>
      <button
        onClick={() => {
          setTokens({ accessToken: '', refreshToken: '' });
          navigate('/login');
        }}
      >
        logout
      </button>
    </div>
  );
};
