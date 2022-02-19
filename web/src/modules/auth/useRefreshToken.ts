import React from 'react';
import { useTokenStore } from './useTokenStore';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useNavigate } from 'react-router-dom';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useConn } from '../conn/useConn';

export const useRefreshToken = () => {
  const { mutate, isLoading } = useTypeSafeMutation('refreshToken');
  const [enabledMeQuery, setEnabledMeQuery] = React.useState(false);
  const conn = useConn();
  useTypeSafeQuery('me', { enabled: enabledMeQuery });
  const setTokens = useTokenStore((s) => s.setTokens);
  const refreshToken = useTokenStore((s) => s.refreshToken);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!conn) return;
    mutate([{ refreshToken }], {
      onSuccess: (data) => {
        if ('accessToken' in data) {
          setEnabledMeQuery(true);
          setTokens({ accessToken: data.accessToken, refreshToken });
        } else {
          navigate('/login');
        }
      },
    });
  }, [mutate, conn]);

  return { isLoading };
};
