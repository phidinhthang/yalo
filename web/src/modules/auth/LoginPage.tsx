import { useTokenStore } from './useTokenStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { useDocumentTitle } from '../../shared-hooks/useDocumentTitle';

const LoginPage = () => {
  const hasTokens = useTokenStore((s) => !!(s.accessToken && s.refreshToken));
  const setTokens = useTokenStore((s) => s.setTokens);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, error, isLoading } = useTypeSafeMutation('login');
  const updateQuery = useTypeSafeUpdateQuery();
  const { t, i18n } = useTypeSafeTranslation();

  useEffect(() => {
    if (hasTokens) {
      navigate('/');
    }
  }, [hasTokens, navigate]);

  useDocumentTitle(`Yalo - ${t('common.login')}`);

  return (
    <>
      <div className='w-screen h-screen flex items-center justify-center flex-col'>
        <form
          className='w-full px-4 max-w-[480px] mx-auto'
          onSubmit={(e) => {
            e.preventDefault();
            login([{ username, password }], {
              onSuccess: (data) => {
                setTokens({
                  accessToken: data.token.access,
                  refreshToken: data.token.refresh,
                });
                updateQuery('me', (x) => {
                  return data.user;
                });
                toast.success(t('pages.login.success'));
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
                {t('common.yourName')}
              </label>
              <Input
                type='text'
                name='username'
                placeholder={t('common.usernamePlaceholder')}
                value={username}
                disabled={isLoading}
                onChange={(e) => setUsername(e.target.value)}
              />
              {error?.errors.username?.map((e, idx) => (
                <p
                  className='mt-1 text-sm text-red-600 dark:text-red-500'
                  key={idx}
                >
                  {i18n.exists(`pages.login.errors.username.${e}`)
                    ? t(`pages.login.errors.username.${e}` as any)
                    : e}
                </p>
              ))}
            </div>
          </div>
          <div className={`${error?.errors.password ? 'mb-0' : 'mb-3'}`}>
            <label
              htmlFor='password'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            >
              {t('common.yourPassword')}
            </label>
            <Input
              type='password'
              name='password'
              placeholder={t('common.passwordPlaceholder')}
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error?.errors.password?.map((e, idx) => (
              <p
                className='mt-1 text-sm text-red-600 dark:text-red-500'
                key={idx}
              >
                {i18n.exists(`pages.login.errors.password.${e}`)
                  ? t(`pages.login.errors.password.${e}` as any)
                  : e}
              </p>
            ))}
          </div>
          <div className='mb-3'>
            {t('pages.login.dontHaveAccount')}{' '}
            <Link to='/register' className='underline'>
              {t('common.register')}
            </Link>
          </div>
          <Button
            type='submit'
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {t('common.login')}
          </Button>
        </form>
        <div className='flex gap-8 mt-8'>
          <button
            className='underline text-sm'
            onClick={() => {
              i18n.changeLanguage('vi');
            }}
          >
            Tiếng Việt
          </button>
          <button
            className='underline text-sm'
            onClick={() => {
              i18n.changeLanguage('en');
            }}
          >
            English
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
