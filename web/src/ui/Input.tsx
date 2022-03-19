import React from 'react';

const sizeClassnames = {
  lg: 'p-4 sm:text-md',
  md: 'p-2.5 text-sm',
  sm: 'p-2 sm:text-xs',
};

interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  size?: keyof typeof sizeClassnames;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', className = '', disabled, ...props }, ref) => {
    const cn = `block w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
      sizeClassnames[size]
    } ${disabled ? 'cursor-not-allowed' : ''} ${className}`;
    return <input className={cn} ref={ref} disabled={disabled} {...props} />;
  }
);
