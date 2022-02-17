import { Connection } from './raw';

export const wrap = (connection: Connection) => ({
  connection,
  query: {
    me: (): Promise<{ id: number; username: string }> =>
      connection.fetch('/users/me'),
  },
  mutation: {
    login: (data: {
      username: string;
      password: string;
    }): Promise<
      | {
          user: { id: number; username: string };
          token: { access: string; refresh: string };
        }
      | { message: [{ path: string[]; message: string }] }
    > => connection.send('/users/login', { body: JSON.stringify(data) }),
    register: (data: {
      username: string;
      password: string;
    }): Promise<{ id: number; username: string }> =>
      connection.send('/users/register', { body: JSON.stringify(data) }),
  },
});
