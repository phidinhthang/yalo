import React, { useState } from 'react';
import { connect, Connection } from '../../lib/raw';
import { useTokenStore } from '../auth/useTokenStore';

export const ConnectionContext = React.createContext<{
  conn: Connection | null;
  setUser: (u: { id: number; username: string }) => void;
  setConn: (u: Connection | null) => void;
}>({
  conn: null,
  setUser: () => {},
  setConn: () => {},
});

export const ConnectionProvider: React.FC<{}> = ({ children }) => {
  const [conn, setConn] = useState<Connection | null>(null);

  React.useEffect(() => {
    if (!conn) {
      connect({}).then((conn) => setConn(conn));
    }
  }, [conn]);

  return (
    <ConnectionContext.Provider
      value={React.useMemo(
        () => ({
          conn,
          setConn,
          setUser: (u: { id: number; username: string }) => {
            if (conn) {
              setConn({
                ...conn,
                user: u,
              });
            }
          },
        }),
        [conn]
      )}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
