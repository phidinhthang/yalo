import { useMediaQuery } from 'react-responsive';

export const useIsDesktopScreen = () => {
  return useMediaQuery({ minWidth: 864 });
};
