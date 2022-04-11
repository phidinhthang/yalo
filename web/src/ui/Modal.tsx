import React from 'react';
import ReactModal from 'react-modal';

const sizeClassnames = {
  default: 'w-full max-w-2xl',
  sm: 'w-full max-w-lg',
};

export const Modal: React.FC<
  ReactModal['props'] & {
    title?: string;
    footer?: React.ReactNode;
    size?: keyof typeof sizeClassnames;
  }
> = ({
  children,
  title,
  footer,
  size = 'default',
  className = '',
  ...props
}) => {
  return (
    <ReactModal
      shouldCloseOnEsc
      shouldFocusAfterRender
      ariaHideApp={false}
      className={`overflow-y-auto overflow-x-hidden flex z-50 justify-center items-center h-full md:inset-0`}
      {...props}
    >
      <div
        className={`relative px-4 ${sizeClassnames[size]} h-full mt-32 md:mt-0 md:h-auto`}
      >
        <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
          <div className='flex justify-between items-start p-5 rounded-t border-b dark:border-gray-600'>
            <h3 className='text-xl font-semibold text-gray-900 lg:text-2xl dark:text-white'>
              {title}
            </h3>
            <button
              type='button'
              className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white'
              onClick={(e) => props.onRequestClose?.(e)}
            >
              <svg
                className='w-5 h-5'
                fill='currentColor'
                viewBox='0 0 20 20'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                ></path>
              </svg>
            </button>
          </div>
          <div className='p-6 space-y-6'>{children}</div>
          {footer ? (
            <div className='flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600'>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </ReactModal>
  );
};
