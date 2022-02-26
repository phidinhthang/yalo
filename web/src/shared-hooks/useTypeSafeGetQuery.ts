import { useCallback } from 'react';
import { InfiniteData, useQuery, useQueryClient } from 'react-query';
import { wrap } from '../lib/wrapper';
import { Await } from '../types/util-types';

type Keys = keyof ReturnType<typeof wrap>['query'];

type PaginatedKey<K extends Keys> = [K, ...(string | number | boolean)[]];

export const useTypeSafeGetQuery = () => {
  const client = useQueryClient();
  return useCallback(
    <K extends Keys>(key: K | PaginatedKey<K>) => {
      return client.getQueryData<
        Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>
      >(key);
    },
    [client]
  );
};

export const useTypeSafeGetInfiniteQuery = () => {
  const client = useQueryClient();
  return useCallback(
    <K extends Keys>(key: K | PaginatedKey<K>) => {
      return client.getQueryData<
        InfiniteData<Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>>
      >(key);
    },
    [client]
  );
};
