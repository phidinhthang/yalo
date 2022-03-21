export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  password: string;
  isOnline: boolean;
  lastLoginAt?: string;
}

export interface ErrorResponse<K extends string = string> {
  errors: {
    [k in K]?: string[];
  };
}

export interface Paginated<Data = unknown> {
  data: Data;
  nextCursor?: string;
  prevCursor?: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export type Message = {
  id: number;
  createdAt: string;
  creator: number;
  conversation: number;
  isDeleted: boolean;
  text?: string;
  images?: Array<{ url: string }>;
};

export type Post = {
  id: number;
  text: string;
  creator: Omit<User, 'password'>;
  numReactions: number;
  reactions: Reaction[];
  createdAt: string;
  updatedAt: string;
};

export type Reaction = {
  id: number;
  user: Omit<User, 'password'>;
  post: Post;
  createdAt: string;
};

export type Member = {
  conversation: number;
  user: User;
  joinedAt: string;
  lastReadAt?: string;
};

export type GetUserInfoResponse = {
  id: number;
  username: string;
  avatarUrl?: string;
  isFriend: boolean;
  userRequestFriend: boolean;
  meRequestFriend: boolean;
};

export type FriendRequest<T extends 'incoming' | 'outgoing'> = {
  id: number;
  username: string;
  avatarUrl: string;
  type: T;
};

export type Conversation = {
  id: number;
  title: null | string;
  type: 'private' | 'group';
  admin: null | Omit<User, 'password'>;
  inviteLinkToken?: string;
  lastMessage: null | Message;
  createdAt: string;
  members: Member[];
  messages: Message[];
};
