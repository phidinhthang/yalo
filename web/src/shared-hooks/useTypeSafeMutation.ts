import { wrap } from '../lib/wrapper';
import { useContext } from 'react';
import { useMutation, UseMutationOptions } from 'react-query';
import { Await } from '../types/util-types';
import { ConnectionContext } from '../modules/conn/ConnectionProvider';

type Keys = keyof ReturnType<typeof wrap>['mutation'];

export const useTypeSafeMutation = <K extends Keys>(
  key: K,
  opts?: UseMutationOptions<
    Await<ReturnType<ReturnType<typeof wrap>['mutation'][K]>>,
    any,
    Parameters<ReturnType<typeof wrap>['mutation'][K]>,
    any
  >
) => {
  const { conn } = useContext(ConnectionContext);

  return useMutation<
    Await<ReturnType<ReturnType<typeof wrap>['mutation'][K]>>,
    any,
    Parameters<ReturnType<typeof wrap>['mutation'][K]>
  >(
    (params) =>
      (wrap(conn!).mutation[typeof key === 'string' ? key : key[0]] as any)(
        ...params
      ),
    opts
  );
};
