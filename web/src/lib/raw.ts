import jwtDecode from 'jwt-decode';
import { useTokenStore } from '../modules/auth/useTokenStore';
const apiUrl = 'http://localhost:4000';
type Token = string;

export type Connection = {
  fetch: (endpoint: string, init?: RequestInit) => Promise<any>;
  send: (endpoint: string, init?: RequestInit) => Promise<any>;
  user?: {
    id: number;
    username: string;
  };
};

export const connect = ({
  url = apiUrl,
}: {
  url?: string;
}): Promise<Connection> =>
  new Promise((res, rej) => {
    const { getState, setState } = useTokenStore;
    const refreshToken = getState().refreshToken;
    const setTokens = getState().setTokens;

    const refresh = async (accessToken: string) => {
      if (accessToken) {
        let shouldRefresh = false;
        try {
          const { exp } = jwtDecode(accessToken) as { exp: number };

          if (Date.now() >= exp * 1000) {
            shouldRefresh = true;
          }
        } catch {
          shouldRefresh = true;
        }

        if (shouldRefresh) {
          const r = await fetch(`${apiUrl}/users/refresh_token`, {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const d = await r.json();
          accessToken = d.accessToken;
          setTokens({ accessToken, refreshToken });
        }
      }
    };

    const connection: Connection = {
      fetch: async (endpoint, init?: RequestInit) => {
        const accessToken = getState().accessToken;
        refresh(accessToken);
        const r = await fetch(`${url}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(init?.headers || {}),
          },
        });
        let data: any;

        data = await r.json();
        console.log('response ', r, 'data', data);
        if (r.status > 399) {
          return Promise.reject(data);
        }
        return data;
      },
      send: async (endpoint, init?: RequestInit) => {
        const accessToken = getState().accessToken;
        refresh(accessToken);
        console.log('body ', init?.body);
        const r = await fetch(`${url}${endpoint}`, {
          method: 'POST',
          body: init?.body,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
        });
        return r.json();
      },
    };
    res(connection);
  });
