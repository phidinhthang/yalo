import React from 'react';
import ContentEditable from 'react-contenteditable';
import { useInView } from 'react-intersection-observer';
import { SvgOutlineHappy } from '../../icons/OutlineHappy';
import { SvgOutlinePhotograph } from '../../icons/OutlinePhotograph';
import { useElementSize } from '../../shared-hooks/useElementSize';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import {
  useTypeSafeQuery,
  useTypeSafeInfiniteQuery,
} from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateInfiniteQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { PostController } from './PostController';

export const MainFeed = () => {
  const { data: me } = useTypeSafeQuery('me');
  const [text, setText] = React.useState('');
  const [ref, inView] = useInView();
  const innerRef = React.useRef<HTMLElement>(null);
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { mutate: createPost, isLoading: createPostLoading } =
    useTypeSafeMutation('createPost');
  const {
    data: posts,
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
    <div className='border-l h-full dark:bg-dark-primary'>
      <div className='p-4 border-b'>
        <h2 className='font-semibold text-3xl'>Post</h2>
      </div>
      <div className='border-b'>
        <div className='flex gap-1 p-4'>
          <Avatar
            src={me?.avatarUrl}
            username={me?.username}
            size='lg'
            className='flex-shrink-0'
          />
          <div className='flex-auto'>
            <div className='border-b'>
              <ContentEditable
                html={text}
                className='border-none outline-none px-2 py-3 text-2xl break-all min-w-[100px]'
                placeholder='What happening ?'
                innerRef={innerRef}
                onChange={(e) => {
                  setText(e.target.value);
                }}
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
  );
};
