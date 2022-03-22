import React from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineHeart } from '../../icons/OutlineHeart';
import { SvgOutlineTrash } from '../../icons/OutlineTrash';
import { SvgSolidDots } from '../../icons/SolidDots';
import { SvgSolidHeart } from '../../icons/SolidHeart';
import { SvgSolidTrash } from '../../icons/SolidTrash';
import { Post } from '../../lib/api/entities';
import { useElementSize } from '../../shared-hooks/useElementSize';
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
  const postId = useParams().postId;

  return (
    <React.Fragment key={p.id}>
      <div
        key={p.id}
        className={`flex flex-col px-4 py-3 ${isDetail ? '' : 'border-b'}`}
      >
        <div className={`flex gap-3 ${isDetail ? 'border-b' : ''}`}>
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
            <div>{p.text}</div>
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
              <div className='flex gap-1 items-center'>
                <IconButton
                  className='bg-transparent'
                  onClick={() => {
                    reactsToPost([p.id, p.reacted !== true ? 1 : 0], {
                      onSuccess: () => {
                        const posts = getQuery('getPaginatedPosts');
                        console.log();
                        if (posts) {
                          updateInfiniteQuery('getPaginatedPosts', (posts) => {
                            posts.pages.forEach((page) =>
                              page.data.forEach((post) => {
                                if (post.id === p.id) {
                                  p.reacted = !p.reacted;
                                  p.numReactions += p.reacted === true ? 1 : -1;
                                }
                              })
                            );
                            return posts;
                          });
                        }
                        const post = getQuery(['getPost', p.id]);
                        console.log('post ', post);
                        if (post) {
                          updateQuery(['getPost', p.id], (_post) => {
                            console.log('_post', _post);
                            _post.reacted = !_post.reacted;
                            _post.numReactions +=
                              _post.reacted === true ? 1 : -1;
                            return _post;
                          });
                        }
                      },
                    });
                  }}
                >
                  {p.reacted ? (
                    <SvgSolidHeart className='text-red-500' />
                  ) : (
                    <SvgOutlineHeart />
                  )}
                </IconButton>
                <span className='text-sm'>{p.numReactions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
