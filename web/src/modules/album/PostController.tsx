import { SvgOutlineChat } from '../../icons/OutlineChat';
import { SvgOutlineHeart } from '../../icons/OutlineHeart';
import { SvgSolidHeart } from '../../icons/SolidHeart';
import { Post } from '../../lib/api/entities';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { useTypeSafeUpdateInfiniteQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar } from '../../ui/Avatar';
import { IconButton } from '../../ui/IconButton';

export const PostController = ({ p }: { p: Post }) => {
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { mutate: reactsToPost } = useTypeSafeMutation('reactsToPost');
  const { t } = useTypeSafeTranslation();

  return (
    <div key={p.id} className='flex gap-3 px-4 py-3 border-b'>
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
          <div>
            <IconButton className='bg-transparent'>
              <SvgOutlineChat />
            </IconButton>
          </div>
          <div className='flex gap-1 items-center'>
            <IconButton
              className='bg-transparent'
              onClick={() => {
                reactsToPost([p.id, p.reacted !== true ? 1 : 0], {
                  onSuccess: () => {
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
  );
};
