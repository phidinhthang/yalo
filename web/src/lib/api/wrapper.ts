import {
  Conversation,
  ErrorResponse,
  FriendRequest,
  Member,
  Message,
  Paginated,
  GetUserInfoResponse,
  Tokens,
  Comment,
  User,
  Post,
  Notification,
} from './entities';
import { Connection } from './raw';
import { _Omit } from './util-types';

export const wrap = (connection: Connection) => ({
  connection,
  query: {
    me: (): Promise<_Omit<User, 'password'>> => connection.fetch('/users/me'),
    findAll: (): Promise<_Omit<User, 'password'>[]> =>
      connection.fetch('/users'),
    searchUser: (
      queriedUsernameStartsWith: string
    ): Promise<_Omit<User, 'password'>[]> =>
      connection.fetch(`/friend/search-user/?q=${queriedUsernameStartsWith}`),
    getUserInfo: (userId: number): Promise<GetUserInfoResponse> =>
      connection.fetch(`/friend/user/${userId}/info`),
    getPaginatedFriends: (): Promise<_Omit<User, 'password'>[]> =>
      connection.fetch(`/friend`),
    getPaginatedRequests: (
      type: 'incoming' | 'outgoing'
    ): Promise<FriendRequest<typeof type>[]> =>
      connection.fetch(`/friend/requests/?type=${type}`),
    getPaginatedPosts: (ctx: {
      nextParam?: string;
    }): Promise<Paginated<Post[]>> =>
      connection.fetch(`/post?${new URLSearchParams(ctx)}`),
    getPost: (postId: number): Promise<Post> =>
      connection.fetch(`/post/${postId}`),
    getPrivateConversation: (data: { id: number }): Promise<Conversation> =>
      connection.fetch(`/conversation/private/${data.id}`),
    getPaginatedConversations: (): Promise<Conversation[]> =>
      connection.fetch(`/conversation`),
    getConversation: (conversationId: number): Promise<Conversation> =>
      connection.fetch(`/conversation/${conversationId}`),
    getPaginatedMessages: (
      data: { conversationId: number },
      ctx: { nextParam?: string }
    ): Promise<Paginated<Message[]>> =>
      connection.fetch(
        `/message/${data.conversationId}?${new URLSearchParams(ctx)}`
      ),
    getPaginatedComments: (
      postId: number,
      ctx: { nextParam?: string }
    ): Promise<Paginated<Comment[]>> =>
      connection.fetch(`/post/${postId}/comment?${new URLSearchParams(ctx)}`),
    getGroupPreview: (inviteLinkToken: string): Promise<Conversation> =>
      connection.fetch(`/conversation/${inviteLinkToken}/preview`),
    getPaginatedNotifications: (): Promise<Notification[]> =>
      connection.fetch(`/notification`),
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
    deleteAccount: (): Promise<boolean> =>
      connection.send('/users/dev/delete-account', { method: 'DELETE' }),
    changeAvatar: ({
      file,
    }: {
      file: File;
    }): Promise<{ avatarUrl: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      return connection.send('/users/change-avatar', {
        body: formData,
      });
    },
    removeAvatar: () =>
      connection.send('/users/remove-avatar', { method: 'DELETE' }),
    createFriendRequest: (targetId: number): Promise<boolean> =>
      connection.send(`/friend/${targetId}/request-friend`),
    acceptFriendRequest: (targetId: number): Promise<boolean> =>
      connection.send(`/friend/${targetId}/accept-request`),
    cancelFriendRequest: (targetId: number): Promise<boolean> =>
      connection.send(`/friend/${targetId}/cancel-request`, {
        method: 'DELETE',
      }),
    removeFriend: (targetId: number): Promise<boolean> =>
      connection.send(`/friend/${targetId}/remove-friend`, {
        method: 'DELETE',
      }),
    reactsToPost: (
      postId: number,
      value: 'like' | 'haha' | 'wow' | 'angry' | 'love' | 'sad',
      action: 'create' | 'remove'
    ) =>
      connection.send(
        `/post/${postId}/reaction?value=${value}&action=${action}`
      ),
    createPost: (data: Pick<Post, 'text'>): Promise<Post> => {
      const formData = new FormData();
      if (data.text) formData.append('text', data.text);
      console.log('create post data ', data);
      console.log(formData);
      return connection.send(`/post/create`, { body: formData });
    },
    deletePost: (postId: number) =>
      connection.send(`/post/${postId}`, { method: 'DELETE' }),
    createComment: (postId: number, data: { text: string }): Promise<Comment> =>
      connection.send(`/post/${postId}/comment`, {
        body: JSON.stringify(data),
      }),
    deleteComment: (commentId: number) =>
      connection.send(`/post/${commentId}/comment`, { method: 'DELETE' }),
    createMessage: (data: {
      conversationId: number;
      text?: string;
      filesOrImages: File[];
    }): Promise<Message | ErrorResponse> => {
      const formData = new FormData();
      console.log('data ', data);
      if (data.text) formData.append('text', data.text);
      data.filesOrImages?.forEach((item) =>
        formData.append(`filesOrImages`, item)
      );

      console.log('form data', Array.from(formData));
      return connection.send(`/message/create/${data.conversationId}`, {
        body: formData,
      });
    },
    reactsToMessage: (
      messageId: number,
      value: 'like' | 'haha' | 'wow' | 'angry' | 'love' | 'sad',
      action: 'create' | 'remove'
    ) =>
      connection.send(
        `/message/${messageId}/reaction?value=${value}&action=${action}`
      ),
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
    changeConversationTitle: (
      conversationId: number,
      data: { title: string }
    ): Promise<boolean | ErrorResponse<'title'>> =>
      connection.send(`/conversation/${conversationId}/title`, {
        body: JSON.stringify(data),
        method: 'PATCH',
      }),
    kickMember: (conversationId: number, memberId: number) =>
      connection.send(
        `/conversation/${conversationId}/${memberId}/kick-member`,
        {
          method: 'DELETE',
        }
      ),
    joinGroupByLink: (inviteLinkToken: string): Promise<Member | boolean> =>
      connection.send(`/conversation/${inviteLinkToken}/join-group`),
    markReadNotifications: (): Promise<void> =>
      connection.send(`/notification/mark-as-read`, { method: 'PATCH' }),
  },
});
