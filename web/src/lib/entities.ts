export interface User {
  id: number;
  username: string;
  password: string;
  isOnline: boolean;
}

export interface ErrorResponse {
  errors: Record<string, string[]>;
}

export interface Tokens {
  access: string;
  refresh: string;
}
