import { forwardRef } from 'react';

export const ChatInfo = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      className='fixed top-0 right-0 bottom-0 w-80 bg-red-100 z-50'
      ref={ref}
    ></div>
  );
});
