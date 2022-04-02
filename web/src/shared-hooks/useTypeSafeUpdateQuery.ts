import { wrap } from '../lib/api/wrapper';
import { useCallback, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { Await } from '../types/util-types';
import { InfiniteData } from 'react-query';

type Keys = keyof ReturnType<typeof wrap>['query'];

type PaginatedKey<K extends Keys> = [K, ...(string | number | boolean)[]];

type Options = {
  check?: boolean;
};

export const useTypeSafeUpdateQuery = () => {
  const client = useQueryClient();

  return useCallback(
    <K extends Keys>(
      key: K | PaginatedKey<K>,
      fn: (
        x: Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>
      ) => Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
      options?: Options
    ) => {
      if (options?.check) {
        const data = client.getQueryData(key);
        if (!data) return;
      }
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
      ) => InfiniteData<Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>>,
      options?: Options
    ) => {
      if (options?.check) {
        const data = client.getQueryData(key);
        if (!data) return;
      }
      client.setQueryData<
        InfiniteData<Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>>
      >(key, fn as any);
    },
    [client]
  );
};
