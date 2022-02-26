import React, { useState } from 'react';
import { connect, Connection } from '../../lib/raw';
import { useTokenStore } from '../auth/useTokenStore';

export const ConnectionContext = React.createContext<{
  conn: Connection | null;
  setConn: (u: Connection | null) => void;
}>({
  conn: null,
  setConn: () => {},
});

export const ConnectionProvider: React.FC<{}> = ({ children }) => {
  const [conn, setConn] = useState<Connection | null>(connect({}));

  return (
    <ConnectionContext.Provider
      value={React.useMemo(
        () => ({
          conn,
          setConn,
        }),
        [conn]
      )}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
