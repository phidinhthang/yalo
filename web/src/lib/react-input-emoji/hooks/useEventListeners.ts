import { useCallback, useMemo } from 'react';
import { Listener, ListenerObj, TextInputListeners } from '../types/types';

function createObserver<T>(): ListenerObj<T> {
  let listeners: Listener<T>[] = [];

  return {
    subscribe: (listener: Listener<T>) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    publish: (event?: T) => {
      listeners.forEach((listener) => listener(event));
    },
    get currentListeners() {
      return listeners;
    },
  };
}

export function useEventListeners() {
  const listeners = useMemo<TextInputListeners>(
    () => ({
      keyDown: createObserver(),
      keyUp: createObserver(),
      arrowUp: createObserver(),
      arrowDown: createObserver(),
      enter: createObserver(),
      focus: createObserver(),
    }),
    []
  );
  const addEventListener = useCallback(
    (event: keyof TextInputListeners, fn: Listener<any>) => {
      return listeners[event].subscribe(fn);
    },
    [listeners]
  );

  return { addEventListener, listeners };
}
