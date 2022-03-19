import { wrap } from '../../lib/api/wrapper';
import { useContext } from 'react';
import { ConnectionContext } from './ConnectionProvider';

export const useConn = () => {
  return useContext(ConnectionContext).conn!;
};

export const useWrappedConn = () => {
  return wrap(useContext(ConnectionContext).conn!);
};
