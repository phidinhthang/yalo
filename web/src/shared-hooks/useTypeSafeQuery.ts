import { wrap } from '../lib/wrapper';
import { useQuery, UseQueryOptions } from 'react-query';
import { useWrappedConn } from '../modules/conn/useConn';
import { Await } from '../types/util-types';
import { ErrorResponse } from '../lib/entities';

type Keys = keyof ReturnType<typeof wrap>['query'];

type PaginatedKey<K extends Keys> = [K, ...(string | number | boolean)[]];

export const useTypeSafeQuery = <K extends Keys>(
  key: K | PaginatedKey<K>,
  opts?: UseQueryOptions,
  params?: Parameters<ReturnType<typeof wrap>['query'][K]>
) => {
  const conn = useWrappedConn();
  type TError = Extract<
    Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
    { errors: any }
  >;
  return useQuery<
    Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
    TError
  >(
    key,
    () => {
      const fn = conn.query[typeof key === 'string' ? key : key[0]] as any;
      return fn(...(params || []));
    },
    { ...opts } as any
  );
};
