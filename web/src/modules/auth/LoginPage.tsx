import { useTokenStore } from './useTokenStore';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';

export const LoginPage = () => {
  const hasTokens = useTokenStore((s) => !!(s.accessToken && s.refreshToken));
  const setTokens = useTokenStore((s) => s.setTokens);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { mutate } = useTypeSafeMutation('login');
  const cache = useTypeSafeUpdateQuery();

  useEffect(() => {
    if (hasTokens) {
      navigate('/');
    }
  }, [hasTokens, navigate]);

  return (
    <>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate([{ username, password }], {
              onSuccess: (data) => {
                console.log('data', data);
                if ('errors' in data) {
                  console.log(data.errors);
                } else {
                  setTokens({
                    accessToken: data.token.access,
                    refreshToken: data.token.refresh,
                  });
                  cache('me', (x) => {
                    return data.user;
                  });
                }
              },
              onError: (error) => {
                console.log('error', error);
              },
            });
          }}
        >
          <div>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            don't have an account ? <Link to='/register'>register</Link>
          </div>
          <button type='submit'>login</button>
        </form>
      </div>
    </>
  );
};
