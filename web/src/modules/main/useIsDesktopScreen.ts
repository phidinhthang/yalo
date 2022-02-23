import { useMediaQuery } from '../../shared-hooks/useMediaQuery';

export const useIsDesktopScreen = () => {
  return useMediaQuery('(min-width: 768px)');
};
