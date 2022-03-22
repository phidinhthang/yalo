import { text } from 'express';
import React from 'react';
import ContentEditable from 'react-contenteditable';
import { useNavigate, useParams } from 'react-router-dom';
import { SvgSolidArrowLeft } from '../../icons/SolidArrowLeft';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { Spinner } from '../../ui/Spinner';
import { PostController } from './PostController';

export const DetailedPost = () => {
  const postIdString = useParams<{ postId: string }>().postId;
  const postIdInt = parseInt(postIdString!);
  const isPostIdValid = !Number.isNaN(postIdInt);
  const { data: post, isLoading } = useTypeSafeQuery(
    ['getPost', postIdInt],
    { enabled: isPostIdValid },
    [postIdInt]
  );
  const { data: me } = useTypeSafeQuery('me');
  const navigate = useNavigate();
  const innerRef = React.useRef<HTMLElement>(null);
  const [text, setText] = React.useState('');

  if (!isPostIdValid) {
    return (
      <div className='border-l h-full flex items-center justify-center'>
        not found
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='border-l h-full flex items-center justify-center'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='border-l h-full'>
      <div className='p-4 flex gap-3 items-center border-b'>
        <IconButton onClick={() => navigate('/a')}>
          <SvgSolidArrowLeft />
        </IconButton>
        <div className='font-semibold text-2xl'>Post</div>
      </div>
      <div className='mt-2'>
        <div>
          <PostController isDetail p={post!} />
          <div className='flex gap-3 px-4 border-b pt-1 pb-3'>
            <Avatar username={me?.username} src={me?.avatarUrl} size='md' />
            <div className='flex flex-auto gap-2 items-end'>
              <ContentEditable
                html={text}
                className='flex-auto border-none outline-none px-2 py-3 text-xl'
                placeholder='Type your reply...'
                onChange={(e) => {
                  setText(e.target.value);
                }}
                innerRef={innerRef}
              />
              <Button>Ok</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};