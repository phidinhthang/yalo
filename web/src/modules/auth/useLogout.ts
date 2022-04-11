import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { toast } from 'react-toastify';
import { useTokenStore } from './useTokenStore';
import { useWsStore } from './useWsStore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useChatStore } from '../chat/useChatStore';

export const useLogout = () => {
  const { t } = useTypeSafeTranslation();
  const setTokens = useTokenStore((s) => s.setTokens);
  const ws = useWsStore((s) => s.ws);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setConversationOpened = useChatStore((s) => s.setConversationOpened);

  const logout = () => {
    setTokens({ accessToken: '', refreshToken: '' });
    ws?.close();
    navigate('/login');
    queryClient.clear();
    setConversationOpened(null);
    toast.success(t('common.logout.success'));
  };

  return logout;
};
