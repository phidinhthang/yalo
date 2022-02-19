import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useRefreshToken } from '../modules/auth/useRefreshToken';
import { useTokenStore } from '../modules/auth/useTokenStore';
import { useWsStore } from '../modules/auth/useWsStore';
import { ConnectionContext } from '../modules/conn/ConnectionProvider';
import { useTypeSafeUpdateQuery } from './useTypeSafeUpdateQuery';

export const useMainWsHandler = () => {
  const { ws, setWs } = useWsStore();

  const updateQuery = useTypeSafeUpdateQuery();
  const accessToken = useTokenStore().accessToken;
  const navigate = useNavigate();

  React.useEffect(() => {
    if (accessToken) {
      const ws = io(`http://localhost:4000/ws`, {
        query: { token: accessToken },
      });
      ws.on('disconnect', () => {
        navigate('/login');
      });
      setWs(ws);
    }
  }, [accessToken]);

  React.useEffect(() => {
    ws?.on('toggle_online', (userId: number) => {
      updateQuery('findAll', (users) => {
        return users?.map((u) => {
          if (u.id === userId) u.isOnline = true;
          return u;
        });
      });
    });
    ws?.on('toggle_offline', (userId: number) => {
      updateQuery('findAll', (users) => {
        return users?.map((u) => {
          if (u.id === userId) u.isOnline = false;
          return u;
        });
      });
    });

    return () => {
      ws?.off('toggle_online');
      ws?.off('toggle_offline');
    };
  }, [ws]);
};

export const MainWsHandlerProvider: React.FC = ({ children }) => {
  useMainWsHandler();
  const { conn } = useContext(ConnectionContext);
  const { isLoading } = useRefreshToken();
  if (!conn || isLoading) return null;
  return <>{children}</>;
};
