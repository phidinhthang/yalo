import React from 'react';
import ContentEditable from 'react-contenteditable';
import { useNavigate, useParams } from 'react-router-dom';
import { SvgOutlineTrash } from '../../icons/OutlineTrash';
import { SvgSolidArrowLeft } from '../../icons/SolidArrowLeft';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import {
  useTypeSafeQuery,
  useTypeSafeInfiniteQuery,
} from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import {
  useTypeSafeUpdateInfiniteQuery,
  useTypeSafeUpdateQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
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
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const updateQuery = useTypeSafeUpdateQuery();
  const { mutate: createComment } = useTypeSafeMutation('createComment');
  const { mutate: deleteComment } = useTypeSafeMutation('deleteComment');
  const { t } = useTypeSafeTranslation();
  const {
    data: comments,
    isLoading: commentsLoading,
    hasNextPage,
    fetchNextPage,
  } = useTypeSafeInfiniteQuery(
    ['getPaginatedComments', postIdInt],
    {
      enabled: isPostIdValid,
      getNextPageParam: (lastPage) => {
        if (!lastPage.nextCursor) return undefined;
        return lastPage;
      },
    },
    [postIdInt]
  );
  const navigate = useNavigate();
  const innerRef = React.useRef<HTMLElement>(null);
  const [text, setText] = React.useState('');

  if (!isPostIdValid || (!post && !isLoading)) {
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
    <div className='border-l h-full w-full'>
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
            <Avatar
              username={me?.username}
              src={me?.avatarUrl}
              size='md'
              className='flex-shrink-0'
            />
            <div className='flex flex-1 gap-2 items-end'>
              <ContentEditable
                html={text}
                className='flex-1 border-none outline-none px-2 py-3 text-xl break-all min-w-[100px]'
                placeholder='Type your reply...'
                onChange={(e) => {
                  setText(e.target.value);
                }}
                innerRef={innerRef}
              />
              <Button
                className='flex-shrink-0'
                disabled={!text.length}
                onClick={() => {
                  createComment([postIdInt, { text }], {
                    onSuccess: (comment) => {
                      setText('');
                      updateQuery(['getPost', postIdInt], (post) => {
                        post.numComments += 1;
                        return post;
                      });
                      updateInfiniteQuery('getPaginatedPosts', (posts) => {
                        posts.pages.forEach((page) => {
                          page.data.forEach((post) => {
                            if (post.id === postIdInt) {
                              post.numComments += 1;
                            }
                          });
                        });
                        return posts;
                      });
                      updateInfiniteQuery(
                        ['getPaginatedComments', postIdInt],
                        (comments) => {
                          comment.creator = me!;
                          comments.pages[0].data.unshift(comment);
                          return comments;
                        }
                      );
                    },
                  });
                }}
              >
                Ok
              </Button>
            </div>
          </div>
          <div>
            <p className='border-b py-2 pl-4'>{post.numComments} comments</p>
            {comments?.pages.map((page) =>
              page.data.map((c) => (
                <div className='flex gap-3 px-4 py-3 border-b' key={c.id}>
                  <Avatar
                    username={c.creator.username}
                    src={c.creator.avatarUrl}
                    size='sm'
                    className='flex-shirnk-0'
                  />
                  <div className='flex-auto'>
                    <div className='flex justify-between items-start'>
                      <div className='flex gap-3 items-center flex-auto'>
                        <p className='font-semibold'>{c.creator.username}</p>
                        <p className='text-xs text-gray-700 italic'>
                          {t('common.ago', { time: new Date(c.createdAt) })}
                        </p>
                      </div>
                      <div>
                        {c.creator.id === me?.id ? (
                          <IconButton
                            onClick={() => {
                              deleteComment([c.id], {
                                onSuccess: () => {
                                  updateInfiniteQuery(
                                    ['getPaginatedComments', postIdInt],
                                    (comments) => {
                                      comments.pages.forEach((page) => {
                                        page.data = page.data.filter(
                                          (comment) => comment.id !== c.id
                                        );
                                      });
                                      return comments;
                                    }
                                  );
                                  updateInfiniteQuery(
                                    'getPaginatedPosts',
                                    (posts) => {
                                      posts.pages.forEach((page) => {
                                        page.data.forEach((post) => {
                                          if (post.id === postIdInt) {
                                            post.numComments -= 1;
                                          }
                                        });
                                      });
                                      return posts;
                                    }
                                  );
                                  updateQuery(['getPost', post.id], (post) => {
                                    post.numComments -= 1;
                                    return post;
                                  });
                                },
                              });
                            }}
                          >
                            <SvgOutlineTrash />
                          </IconButton>
                        ) : null}
                      </div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: c.text }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
