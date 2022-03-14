import React from 'react';

interface IconButtonProps extends React.ComponentPropsWithoutRef<'button'> {}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  const cn = `w-8 h-8 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 text-black dark:bg-dark-500 dark:hover:bg-gray-600 dark:text-white ${className}`;
  return (
    <button className={cn} {...props}>
      {children}
    </button>
  );
};
