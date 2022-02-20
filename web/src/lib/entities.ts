export interface User {
  id: number;
  username: string;
  password: string;
  isOnline: boolean;
}

export interface ErrorResponse<K extends string = string> {
  errors: {
    [k in K]: string[];
  };
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
