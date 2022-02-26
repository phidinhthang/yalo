import { useNavigate } from 'react-router-dom';
import { SvgSolidUser } from '../icons/SolidUser';

export const NavigationBottom = () => {
  const navigate = useNavigate();

  return (
    <div className='flex shadow-sm'>
      <a
        href='#'
        aria-current='page'
        className='flex-grow flex flex-col items-center py-2 px-4 text-sm font-medium text-blue-700 bg-white rounded-l-lg border border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white'
        onClick={(e) => {
          e.preventDefault();
          navigate('/users');
        }}
      >
        <SvgSolidUser />
        <span className='mt-1'>Users</span>
      </a>
      <a
        href='#'
        className='flex-grow flex flex-col items-center py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white'
        onClick={(e) => {
          e.preventDefault();
          navigate('/conversations');
        }}
      >
        <SvgSolidUser />
        <span className='mt-1'>conversations</span>
      </a>
      <a
        href='#'
        className='flex-grow flex flex-col items-center py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white'
        onClick={(e) => {
          e.preventDefault();
          navigate('/');
        }}
      >
        <SvgSolidUser />
        <span className='mt-1'>messages</span>
      </a>
    </div>
  );
};
