import React from 'react';

export const useSleep = (ms: number = 1000) => {
  const [sleeping, setSleeping] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setSleeping(false);
    }, ms);
  }, []);

  return sleeping;
};
