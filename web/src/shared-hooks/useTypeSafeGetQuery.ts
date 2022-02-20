import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { wrap } from '../lib/wrapper';

type Keys = keyof ReturnType<typeof wrap>['query'];

type PaginatedKey<K extends Keys> = [K, ...(string | number | boolean)[]];

export const useTypeSafeGetQuery = () => {
  const client = useQueryClient();
  return useCallback(
    <K extends Keys>(key: K | PaginatedKey<K>) => {
      return client.getQueryData<
        Awaited<ReturnType<ReturnType<typeof wrap>['query'][K]>>
      >(key);
    },
    [client]
  );
};
