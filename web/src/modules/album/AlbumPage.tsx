import React from 'react';
import ContentEditable from 'react-contenteditable';
import { useNavigate } from 'react-router-dom';
import { SvgOutlineHappy } from '../../icons/OutlineHappy';
import { SvgOutlinePhotograph } from '../../icons/OutlinePhotograph';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { MainLayout } from '../../ui/MainLayout';

const AlbumPage = () => {
  const { data: me } = useTypeSafeQuery('me');
  const innerRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    innerRef.current?.focus();
  }, []);
  return (
    <MainLayout
      leftPanel={
        <div className=''>
          <h3 className='font-semibold text-2xl p-3'>Notification</h3>
        </div>
      }
    >
      <div className='border-l h-full'>
        <div className='p-4 border-b'>
          <h2 className='font-semibold text-3xl'>Post</h2>
        </div>
        <div className='border-b'>
          <div className='flex gap-1 p-4'>
            <Avatar src={me?.avatarUrl} username={me?.username} size='lg' />
            <div className='flex-1'>
              <div className='border-b'>
                <ContentEditable
                  html=''
                  className='border-none outline-none px-2 py-3 text-2xl'
                  placeholder='What happening ?'
                  onChange={() => {}}
                  innerRef={innerRef}
                />
              </div>
              <div className='flex justify-between items-center mt-4'>
                <div className='flex gap-2 items-center'>
                  <IconButton>
                    <SvgOutlinePhotograph className='w-5 h-5' />
                  </IconButton>
                  <IconButton>
                    <SvgOutlineHappy className='w-5 h-5' />
                  </IconButton>
                </div>
                <Button>Tweet</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AlbumPage;
