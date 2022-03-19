import { wrap } from '../lib/api/wrapper';
import { useCallback, useContext } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import { ConnectionContext } from '../modules/conn/ConnectionProvider';
import { Await } from '../types/util-types';
import { useWrappedConn } from '../modules/conn/useConn';
import { InfiniteData } from 'react-query';

type Keys = keyof ReturnType<typeof wrap>['query'];

type PaginatedKey<K extends Keys> = [K, ...(string | number | boolean)[]];

export const useTypeSafeUpdateQuery = () => {
  const client = useQueryClient();

  return useCallback(
    <K extends Keys>(
      key: K | PaginatedKey<K>,
      fn: (
        x: Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>
      ) => Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>
    ) => {
      client.setQueryData<
        Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>
      >(key, fn as any);
    },
    [client]
  );
};

export const useTypeSafeUpdateInfiniteQuery = () => {
  const client = useQueryClient();
  return useCallback(
    <K extends Keys>(
      key: K | PaginatedKey<K>,
      fn: (
        x: InfiniteData<Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>>
      ) => InfiniteData<Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>>
    ) => {
      client.setQueryData<
        InfiniteData<Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>>
      >(key, fn as any);
    },
    [client]
  );
};
