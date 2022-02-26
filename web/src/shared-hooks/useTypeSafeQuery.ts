import { wrap } from '../lib/wrapper';
import {
  useQuery,
  UseQueryOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from 'react-query';
import { useWrappedConn } from '../modules/conn/useConn';
import { Await } from '../types/util-types';
import { DropLastParameter } from '../types/util-types';

type Keys = keyof ReturnType<typeof wrap>['query'];

type PaginatedKey<K extends Keys> = [K, ...(string | number | boolean)[]];

export const useTypeSafeQuery = <
  K extends Keys,
  TData = Exclude<
    Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
    { errors: any }
  >,
  TError = Extract<
    Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
    { errors: any }
  >
>(
  key: K | PaginatedKey<K>,
  opts?: UseQueryOptions<TData, TError>,
  params?: Parameters<ReturnType<typeof wrap>['query'][K]>
) => {
  const conn = useWrappedConn();
  return useQuery<TData, TError>(
    key,
    () => {
      const fn = conn.query[typeof key === 'string' ? key : key[0]] as any;
      return fn(...(params || []));
    },
    { ...opts } as any
  );
};

export const useTypeSafeInfiniteQuery = <
  K extends Keys,
  TData = Exclude<
    Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
    { errors: any }
  >,
  TError = Extract<
    Await<ReturnType<ReturnType<typeof wrap>['query'][K]>>,
    { errors: any }
  >
>(
  key: K | PaginatedKey<K>,
  opts?: UseInfiniteQueryOptions<TData, TError>,
  params?: DropLastParameter<Parameters<ReturnType<typeof wrap>['query'][K]>>
) => {
  const conn = useWrappedConn();

  return useInfiniteQuery<TData, TError>(
    key,
    (ctx) => {
      const fn = conn.query[typeof key === 'string' ? key : key[0]] as any;
      return fn(...(params || []), ctx.pageParam);
    },
    { ...opts } as any
  );
};
