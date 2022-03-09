import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export function useDarkMode() {
  const [enabledState, setEnabledState] = useLocalStorage<boolean>(
    'dark-mode',
    false
  );

  useEffect(() => {
    const element = window.document.documentElement;
    element.classList.add(enabledState ? 'dark' : 'light');
    element.classList.remove(enabledState ? 'light' : 'dark');
  }, [enabledState]);

  return [enabledState, setEnabledState];
}
