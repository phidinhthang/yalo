import React from 'react';
import ContentEditable from 'react-contenteditable';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineHappy } from '../../icons/OutlineHappy';
import { SvgOutlineHeart } from '../../icons/OutlineHeart';
import { SvgOutlinePhotograph } from '../../icons/OutlinePhotograph';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import {
  useTypeSafeInfiniteQuery,
  useTypeSafeQuery,
} from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateInfiniteQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { MainLayout } from '../../ui/MainLayout';
import { PostController } from './PostController';

const AlbumPage = () => {
  const { data: me } = useTypeSafeQuery('me');
  const [text, setText] = React.useState('');
  const innerRef = React.useRef<HTMLElement>(null);
  const [ref, inView] = useInView();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { mutate: createPost, isLoading: createPostLoading } =
    useTypeSafeMutation('createPost');
  const { mutate: reactsToPost } = useTypeSafeMutation('reactsToPost');
  const {
    data: posts,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useTypeSafeInfiniteQuery('getPaginatedPosts', {
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor) return undefined;
      return lastPage;
    },
  });

  if (inView && hasNextPage) {
    fetchNextPage();
  }

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
                  html={text}
                  className='border-none outline-none px-2 py-3 text-2xl'
                  placeholder='What happening ?'
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
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
                <Button
                  disabled={!text.length}
                  loading={createPostLoading}
                  onClick={() => {
                    console.log(text);
                    createPost([{ text }], {
                      onSuccess: (post) => {
                        updateInfiniteQuery('getPaginatedPosts', (posts) => {
                          post.creator = me!;
                          posts.pages?.[0]?.data?.unshift(post);
                          return posts;
                        });
                      },
                      onSettled: () => {
                        setText('');
                      },
                    });
                  }}
                >
                  Ok
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className=''>
          {posts?.pages.map((page) =>
            page.data.map((p) => <PostController p={p} key={p.id} />)
          )}
          {hasNextPage ? <div ref={ref}></div> : null}
        </div>
      </div>
    </MainLayout>
  );
};

export default AlbumPage;
