import React from 'react';

export const useDocumentTitle = (title: string) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
};
