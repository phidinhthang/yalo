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
          className='w-full px-4 max-w-[480px] m-auto'
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
          <div className='mb-6'>
            <label
              htmlFor='username'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            >
              Your name
            </label>
            <input
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com'
              type='text'
              name='username'
              placeholder='Enter your username...'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='mb-3'>
            <label
              htmlFor='password'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            >
              Your password
            </label>
            <input
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              type='password'
              name='password'
              placeholder='Enter your password...'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='mb-3'>
            don't have an account ?{' '}
            <Link to='/register' className='underline'>
              register
            </Link>
          </div>
          <button
            type='submit'
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
          >
            login
          </button>
        </form>
      </div>
    </>
  );
};
