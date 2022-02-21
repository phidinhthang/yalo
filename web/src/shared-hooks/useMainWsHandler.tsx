import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Message } from '../lib/entities';
import { useRefreshToken } from '../modules/auth/useRefreshToken';
import { useTokenStore } from '../modules/auth/useTokenStore';
import { useWsStore } from '../modules/auth/useWsStore';
import { ConnectionContext } from '../modules/conn/ConnectionProvider';
import { useTypeSafeUpdateQuery } from './useTypeSafeUpdateQuery';
import { useWrappedConn } from '../modules/conn/useConn';
import { useTypeSafeGetQuery } from './useTypeSafeGetQuery';

export const useMainWsHandler = () => {
  const { ws, setWs } = useWsStore();

  const updateQuery = useTypeSafeUpdateQuery();
  const getQuery = useTypeSafeGetQuery();
  const accessToken = useTokenStore().accessToken;
  const navigate = useNavigate();
  const wConn = useWrappedConn();

  React.useEffect(() => {
    if (accessToken) {
      const ws = io(import.meta.env.VITE_API_URL, {
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

    ws?.on('new_message', async (message: Message) => {
      const conversations = getQuery('getPaginatedConversations');
      if (!conversations) return;
      let conversation = conversations.find(
        (c) => c.id === message.conversation
      );
      updateQuery('getPaginatedConversations', (conversations) => {
        return conversations.map((c) => {
          if (c.id === conversation!.id) {
            c.lastMessage = message;
          }
          return c;
        });
      });
      if (conversation) return;
      conversation = await wConn.query.getPrivateConversation({
        id: message.conversation,
      });
      updateQuery('getPaginatedConversations', (conversations) => {
        conversations.unshift(conversation!);
        return conversations;
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
