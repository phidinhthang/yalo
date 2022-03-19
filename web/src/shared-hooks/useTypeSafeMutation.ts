import { wrap } from '../lib/api/wrapper';
import { useContext } from 'react';
import { useMutation, UseMutationOptions } from 'react-query';
import { Await } from '../types/util-types';
import { ConnectionContext } from '../modules/conn/ConnectionProvider';

type Keys = keyof ReturnType<typeof wrap>['mutation'];

export const useTypeSafeMutation = <
  K extends Keys,
  TData = Exclude<
    Await<ReturnType<ReturnType<typeof wrap>['mutation'][K]>>,
    { errors: any }
  >,
  TError = Extract<
    Await<ReturnType<ReturnType<typeof wrap>['mutation'][K]>>,
    { errors: any }
  >
>(
  key: K,
  opts?: UseMutationOptions<
    TData,
    TError,
    Parameters<ReturnType<typeof wrap>['mutation'][K]>,
    any
  >
) => {
  const { conn } = useContext(ConnectionContext);

  return useMutation<
    TData,
    TError,
    Parameters<ReturnType<typeof wrap>['mutation'][K]>
  >(
    (params) =>
      (wrap(conn!).mutation[typeof key === 'string' ? key : key[0]] as any)(
        ...params
      ),
    opts
  );
};
