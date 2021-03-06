import React from 'react';
import { SvgSolidSearch } from '../../icons/SolidSearch';
import { Spinner } from '../Spinner';

interface SearchBarProps extends React.ComponentPropsWithoutRef<'input'> {
  inputClassname?: string;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  inputClassname = '',
  className = '',
  isLoading = false,
  ...props
}) => {
  const [isFocus, setFocus] = React.useState(false);
  return (
    <div
      className={`items-center flex w-full rounded-lg h-10 border-2 ${
        isFocus
          ? 'border-blue-500 dark:ring-blue-500 dark:border-blue-500'
          : 'border-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white'
      }`}
      tabIndex={0}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <div className='h-full px-2 flex items-center pointer-events-none bg-white dark:bg-gray-700 dark:text-white rounded-l-lg'>
        <SvgSolidSearch className='w-6 h-6' />
      </div>
      <input
        className='w-full h-full focus:border-0 focus:outline-0 rounded-r-lg dark:bg-gray-700 dark:text-white'
        {...(props as any)}
      />
      {isLoading ? <Spinner className='mr-2 text-gray-700' /> : null}
    </div>
  );
};
