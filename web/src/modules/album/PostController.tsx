import React from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineHeart } from '../../icons/OutlineHeart';
import { SvgOutlineTrash } from '../../icons/OutlineTrash';
import { SvgSolidDots } from '../../icons/SolidDots';
import { SvgSolidHeart } from '../../icons/SolidHeart';
import { SvgSolidThumbUp } from '../../icons/SolidThumbUp';
import { SvgSolidTrash } from '../../icons/SolidTrash';
import { Post } from '../../lib/api/entities';
import { useElementSize } from '../../shared-hooks/useElementSize';
import { useOnClickOutside } from '../../shared-hooks/useOnClickOutside';
import { useTypeSafeGetQuery } from '../../shared-hooks/useTypeSafeGetQuery';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import {
  useTypeSafeUpdateInfiniteQuery,
  useTypeSafeUpdateQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { Modal } from '../../ui/Modal';
import { ReactionPicker } from '../../ui/Reaction/ReactionPicker';
import { ReactionStats } from '../../ui/Reaction/ReactionStats';

interface PostControllerProps {
  p: Post;
  isDetail?: boolean;
}

export const PostController = ({
  p,
  isDetail = false,
}: PostControllerProps) => {
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { mutate: reactsToPost } = useTypeSafeMutation('reactsToPost');
  const { mutate: deletePost } = useTypeSafeMutation('deletePost');
  const { t } = useTypeSafeTranslation();
  const navigate = useNavigate();
  const getQuery = useTypeSafeGetQuery();
  const updateQuery = useTypeSafeUpdateQuery();
  const { data: me } = useTypeSafeQuery('me');
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = React.useState(false);
  const postId = useParams().postId;
  const numReactions = Object.values(p.numReactions).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const pickerWrapperRef = React.useRef<HTMLDivElement>(null);
  const usedReactions = Object.keys(p.numReactions).filter(
    // @ts-ignore
    (r) => p.numReactions[r] !== undefined && p.numReactions[r] !== 0
  );
  useOnClickOutside(pickerWrapperRef, () => {
    setIsReactionPickerOpen(false);
  });

  return (
    <React.Fragment key={p.id}>
      <div
        key={p.id}
        className={`flex flex-col px-4 py-3 ${isDetail ? '' : 'border-b'}`}
      >
        <div className={`flex gap-3 ${isDetail ? 'border-b pb-2' : ''}`}>
          <Avatar
            size='md'
            src={p.creator.avatarUrl}
            username={p.creator.username}
          />
          <div className='flex-auto'>
            <div className='flex justify-between items-center w-full'>
              <div className='flex gap-3 items-center'>
                <p className='text-lg font-semibold'>{p.creator.username}</p>
                <p className='text-xs text-gray-700 italic'>
                  {t('common.ago', { time: new Date(p.createdAt) })}
                </p>
              </div>
              <div className='flex gap-1 items-center'>
                {me?.id === p.creator.id ? (
                  <>
                    <IconButton
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                    >
                      <SvgOutlineTrash />{' '}
                    </IconButton>
                    <Modal
                      title='Delete post'
                      isOpen={isModalOpen}
                      onRequestClose={(e) => {
                        setIsModalOpen(false);
                      }}
                      footer={
                        <div className='flex w-full'>
                          <div className='flex-grow'></div>
                          <Button
                            onClick={(e) => {
                              deletePost([p.id], {
                                onSuccess: () => {
                                  const posts = getQuery('getPaginatedPosts');
                                  if (posts) {
                                    updateInfiniteQuery(
                                      'getPaginatedPosts',
                                      (posts) => {
                                        const pages = posts.pages.map(
                                          (page) => ({
                                            ...page,
                                            data: page.data.filter(
                                              (post) => post.id !== p.id
                                            ),
                                          })
                                        );
                                        return { ...posts, pages };
                                      }
                                    );
                                  }
                                  const post = getQuery(['getPost', p.id]);
                                  if (post) {
                                    queryClient.removeQueries(
                                      ['getPost', p.id],
                                      { exact: true }
                                    );
                                  }
                                  if (postId) navigate('/a');
                                },
                              });
                              setIsModalOpen(false);
                            }}
                            className=''
                          >
                            ok
                          </Button>
                        </div>
                      }
                    >
                      Are you sure to delete post ?
                    </Modal>
                  </>
                ) : null}
                <IconButton>
                  <SvgSolidDots />
                </IconButton>
              </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: p.text }} />
            <div className='flex gap-3 items-center mt-1'>
              <div className='flex gap-1 items-center'>
                <IconButton
                  className='bg-transparent'
                  onClick={() => navigate(`/a/${p.id}`)}
                >
                  <SvgOutlineChat />
                </IconButton>
                <span className='text-sm'>{p.numComments}</span>
              </div>
              <div className='flex gap-1 items-center' ref={pickerWrapperRef}>
                <ReactionStats
                  numReactions={numReactions}
                  reactions={
                    usedReactions.length ? usedReactions : (['like'] as any)
                  }
                />
                <div className='relative'>
                  <IconButton
                    onClick={() => setIsReactionPickerOpen((o) => !o)}
                    className='text-[#5890FF] bg-gray-50 hover:bg-gray-200'
                  >
                    <SvgSolidThumbUp />
                  </IconButton>
                  {isReactionPickerOpen ? (
                    <ReactionPicker
                      className='absolute bottom-full right-1/2 transform translate-x-1/2'
                      iconSize={32}
                      onSelect={(label) => {
                        reactsToPost(
                          [
                            p.id,
                            label,
                            p.reaction !== label ? 'create' : 'remove',
                          ],
                          {
                            onSuccess: () => {
                              const posts = getQuery('getPaginatedPosts');
                              if (posts) {
                                updateInfiniteQuery(
                                  'getPaginatedPosts',
                                  (posts) => {
                                    posts.pages.forEach((page) =>
                                      page.data.forEach((post) => {
                                        if (post.id === p.id) {
                                          post.numReactions = {
                                            ...post.numReactions,
                                            [label]:
                                              p.reaction === label
                                                ? (post.numReactions[label] ??
                                                    1) - 1
                                                : (post.numReactions[label] ??
                                                    0) + 1,
                                          };
                                          if (
                                            p.reaction &&
                                            p.reaction !== label
                                          ) {
                                            post.numReactions[p.reaction] =
                                              (post.numReactions[p.reaction] ??
                                                1) - 1;
                                          }
                                          post.reaction =
                                            post.reaction === label
                                              ? undefined
                                              : label;
                                        }
                                      })
                                    );
                                    return posts;
                                  }
                                );
                              }
                              const post = getQuery(['getPost', p.id]);
                              if (post) {
                                updateQuery(['getPost', p.id], (post) => {
                                  post.numReactions = {
                                    ...post.numReactions,
                                    [label]:
                                      p.reaction === label
                                        ? (post.numReactions[label] ?? 1) - 1
                                        : (post.numReactions[label] ?? 0) + 1,
                                  };
                                  if (p.reaction && p.reaction !== label) {
                                    post.numReactions[p.reaction] =
                                      (post.numReactions[p.reaction] ?? 1) - 1;
                                  }
                                  post.reaction =
                                    post.reaction === label ? undefined : label;
                                  return post;
                                });
                              }
                            },
                          }
                        );
                        setIsReactionPickerOpen(false);
                      }}
                      reactions={[
                        'angry',
                        'haha',
                        'like',
                        'love',
                        'sad',
                        'wow',
                      ]}
                      picked={p.reaction}
                    />
                  ) : null}
                </div>
                {/* <IconButton
                  className='bg-transparent'
                  onClick={() => {
                  }}
                >
                  {p.reacted ? (
                    <SvgSolidHeart className='text-red-500' />
                  ) : (
                    <SvgOutlineHeart />
                  )}
                </IconButton> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
