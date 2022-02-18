import React from 'react';
import { useTokenStore } from './useTokenStore';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useNavigate } from 'react-router-dom';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';

export const useRefreshToken = () => {
  const { mutate, isLoading } = useTypeSafeMutation('refreshToken');
  const [enabledMeQuery, setEnabledMeQuery] = React.useState(false);
  useTypeSafeQuery('me', { enabled: enabledMeQuery });
  const setTokens = useTokenStore((s) => s.setTokens);
  const refreshToken = useTokenStore((s) => s.refreshToken);
  const navigate = useNavigate();
  React.useEffect(() => {
    mutate([{ refreshToken }], {
      onSuccess: (data) => {
        if ('statusCode' in data) {
          navigate('/login');
        } else {
          setEnabledMeQuery(true);
          setTokens({ accessToken: data.accessToken, refreshToken });
        }
      },
    });
  }, [mutate]);

  return { isLoading };
};
