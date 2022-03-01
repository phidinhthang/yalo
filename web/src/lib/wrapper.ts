import {
  Conversation,
  ErrorResponse,
  Message,
  Paginated,
  Tokens,
  User,
} from './entities';
import { Connection } from './raw';
import { _Omit } from './util-types';

export const wrap = (connection: Connection) => ({
  connection,
  query: {
    me: (): Promise<_Omit<User, 'password'>> => connection.fetch('/users/me'),
    findAll: (): Promise<_Omit<User, 'password'>[]> =>
      connection.fetch('/users'),
    getPrivateConversation: (data: { id: number }): Promise<Conversation> =>
      connection.fetch(`/conversation/private/${data.id}`),
    getPaginatedConversations: (): Promise<Conversation[]> =>
      connection.fetch(`/conversation`),
    getPaginatedMessages: (
      data: { conversationId: number },
      ctx: { nextParam?: string }
    ): Promise<Paginated<Message[]>> =>
      connection.fetch(
        `/message/${data.conversationId}?${new URLSearchParams(ctx)}`
      ),
  },
  mutation: {
    refreshToken: (data: {
      refreshToken: string;
    }): Promise<{ accessToken: string } | ErrorResponse> =>
      connection.send('/users/refresh_token', { body: JSON.stringify(data) }),
    login: (
      data: Pick<User, 'username' | 'password'>
    ): Promise<
      | {
          user: _Omit<User, 'password'>;
          token: Tokens;
        }
      | ErrorResponse<'username' | 'password'>
    > => connection.send('/users/login', { body: JSON.stringify(data) }),
    register: (
      data: Pick<User, 'username' | 'password'>
    ): Promise<
      | {
          user: _Omit<User, 'password'>;
          token: Tokens;
        }
      | ErrorResponse<'username' | 'password'>
    > => connection.send('/users/register', { body: JSON.stringify(data) }),
    createMessage: (
      data: Pick<Message, 'text'> & { conversationId: number }
    ): Promise<Message | ErrorResponse> =>
      connection.send(`/message/create/${data.conversationId}`, {
        body: JSON.stringify(data),
      }),
    createGroupConversation: (data: {
      title: string;
      memberIds: number[];
    }): Promise<Conversation | ErrorResponse<'memberIds' | 'title'>> =>
      connection.send(`/conversation`, { body: JSON.stringify(data) }),
  },
});
