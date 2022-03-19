import { Spinner } from './Spinner';

export const ScreenLoader = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <Spinner size='xxl' className='text-blue-600' />
    </div>
  );
};
