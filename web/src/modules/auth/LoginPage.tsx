import { useTokenStore } from './useTokenStore';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export const LoginPage = () => {
  const hasTokens = useTokenStore((s) => !!(s.accessToken && s.refreshToken));
  const setTokens = useTokenStore((s) => s.setTokens);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, error, isLoading } = useTypeSafeMutation('login');
  const updateQuery = useTypeSafeUpdateQuery();
  useEffect(() => {
    if (hasTokens) {
      navigate('/');
    }
  }, [hasTokens, navigate]);

  return (
    <>
      <div>
        <form
          className='w-full px-4 max-w-[480px] m-auto'
          onSubmit={(e) => {
            e.preventDefault();
            mutate([{ username, password }], {
              onSuccess: (data) => {
                setTokens({
                  accessToken: data.token.access,
                  refreshToken: data.token.refresh,
                });
                updateQuery('me', (x) => {
                  return data.user;
                });
              },
            });
          }}
        >
          <div className={`${error?.errors.username ? 'mb-1' : 'mb-6'}`}>
            <div>
              <label
                htmlFor='username'
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
              >
                Your name
              </label>
              <Input
                type='text'
                name='username'
                placeholder='Enter your username...'
                value={username}
                disabled={isLoading}
                onChange={(e) => setUsername(e.target.value)}
              />
              {error?.errors.username?.map((e, idx) => (
                <p
                  className='mt-1 text-sm text-red-600 dark:text-red-500'
                  key={idx}
                >
                  {e}
                </p>
              ))}
            </div>
          </div>
          <div className={`${error?.errors.password ? 'mb-0' : 'mb-3'}`}>
            <label
              htmlFor='password'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            >
              Your password
            </label>
            <Input
              type='password'
              name='password'
              placeholder='Enter your password...'
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error?.errors.password?.map((e, idx) => (
              <p
                className='mt-1 text-sm text-red-600 dark:text-red-500'
                key={idx}
              >
                {e}
              </p>
            ))}
          </div>
          <div className='mb-3'>
            don't have an account ?{' '}
            <Link to='/register' className='underline'>
              register
            </Link>
          </div>
          <Button
            type='submit'
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            login
          </Button>
        </form>
      </div>
    </>
  );
};
