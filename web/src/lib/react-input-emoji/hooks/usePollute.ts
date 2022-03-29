import { useCallback, useRef } from 'react';

import { PolluteFn } from '../types/types';
export function usePollute() {
  const polluteFnsRef = useRef<PolluteFn[]>([]);

  const addPolluteFn = useCallback((fn: PolluteFn) => {
    polluteFnsRef.current.push(fn);
  }, []);

  const pollute = useCallback((text: string) => {
    const result = polluteFnsRef.current.reduce((acc, fn) => {
      return fn(acc);
    }, text);

    return result;
  }, []);

  return { addPolluteFn, pollute };
}
