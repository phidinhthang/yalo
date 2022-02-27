import { AvatarMenu } from './AvatarMenu';

export const SideBar = () => {
  return (
    <div className='w-16 h-full flex flex-col p-1 items-center shadow-md'>
      <div className='flex items-center justify-center pt-3'>
        <AvatarMenu />
      </div>
    </div>
  );
};
