export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  password: string;
  isOnline: boolean;
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
  text: string;
};

export type Member = {
  conversation: number;
  user: User;
  joinedAt: string;
};

export type Conversation = {
  id: number;
  title: null | string;
  type: string;
  admin: null | string;
  lastMessage: null | Message;
  createdAt: string;
  members: Member[];
  messages: Message[];
};
