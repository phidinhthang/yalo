import {
  Conversation,
  ErrorResponse,
  Member,
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
      data: Pick<Message, 'text'> & { conversationId: number } & {
        images?: File[];
      }
    ): Promise<Message | ErrorResponse> => {
      const formData = new FormData();
      console.log('data ', data);
      if (data.text) formData.append('text', data.text);
      data.images?.forEach((i, idx) => formData.append(`images`, i));

      console.log('form data', Array.from(formData));
      return connection.send(`/message/create/${data.conversationId}`, {
        body: formData,
      });
    },
    deleteMessage: (messageId: number) =>
      connection.send(`/message/${messageId}`, { method: 'DELETE' }),
    markReadMsg: (conversationId: number) =>
      connection.send(`/conversation/member/mark_read/${conversationId}`, {
        method: 'PATCH',
      }),
    createGroupConversation: (data: {
      title: string;
      memberIds: number[];
    }): Promise<Conversation | ErrorResponse<'memberIds' | 'title'>> =>
      connection.send(`/conversation`, { body: JSON.stringify(data) }),
    leaveGroupConversation: (conversationId: number): Promise<boolean> =>
      connection.send(`/conversation/member/${conversationId}`, {
        method: 'DELETE',
      }),
    deleteGroupConversation: (
      conversationId: number
    ): Promise<boolean | ErrorResponse<'conversationId'>> =>
      connection.send(`/conversation/${conversationId}`, { method: 'DELETE' }),
    addMember: (conversationId: number, userIds: number[]): Promise<Member[]> =>
      connection.send(`/conversation/${conversationId}/add-members`, {
        body: JSON.stringify(userIds),
      }),
  },
});
