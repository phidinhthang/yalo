import React from 'react';
import { useWindowSize } from '../shared-hooks/useWindowSize';

export const FullHeight: React.FC = ({ children }) => {
  const { height } = useWindowSize();
  return <div style={{ height }}>{children}</div>;
};
