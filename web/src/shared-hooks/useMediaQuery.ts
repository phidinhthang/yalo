import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const getMatches = (query: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    const debounced = debounce(handleChange, 1000);
    matchMedia.addEventListener('change', debounced);

    handleChange();

    return () => {
      debounced.cancel();
      matchMedia.removeEventListener('change', debounced);
    };
  }, [query, handleChange]);

  return matches;
};
