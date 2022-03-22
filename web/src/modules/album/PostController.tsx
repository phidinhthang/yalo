import { text } from 'express';
import React from 'react';
import ContentEditable from 'react-contenteditable';
import { useNavigate } from 'react-router-dom';
import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineHeart } from '../../icons/OutlineHeart';
import { SvgSolidHeart } from '../../icons/SolidHeart';
import { Post } from '../../lib/api/entities';
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
  const { t } = useTypeSafeTranslation();
  const navigate = useNavigate();
  const getQuery = useTypeSafeGetQuery();
  const updateQuery = useTypeSafeUpdateQuery();

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
          <div>
            <div>
              <div className='flex gap-3 items-center'>
                <p className='text-lg font-semibold'>{p.creator.username}</p>
                <p className='text-xs text-gray-700 italic'>
                  {t('common.ago', { time: new Date(p.createdAt) })}
                </p>
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
