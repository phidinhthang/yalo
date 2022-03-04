import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { SvgSolidDots } from '../../icons/SolidDots';
import { Conversation, User } from '../../lib/entities';
import { Avatar, AvatarGroup } from '../../ui/Avatar';
import React from 'react';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';

interface ConversationItemProps {
  conversation: Conversation;
  onOpened: (id: number) => void;
  me: Omit<User, 'password'>;
}

export const ConversationItem = ({
  conversation: c,
  onOpened,
  me,
}: ConversationItemProps) => {
  const { t } = useTypeSafeTranslation();
  const members = c.members.filter((m) => m.user.id !== me.id);
  const lastMessageSentByMe =
    c.lastMessage?.creator === me.id ||
    (c.lastMessage?.creator as any)?.id === me.id;
  const partner = c.members.filter(
    (m) => m.user?.id !== undefined && m.user.id !== me!.id
  )[0]?.user;
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpenMenu, setIsOpenMenu] = React.useState(false);
  const { mutate: leaveGroupConversation } = useTypeSafeMutation(
    'leaveGroupConversation'
  );
  const { mutate: deleteGroupConversation } = useTypeSafeMutation(
    'deleteGroupConversation'
  );

  return (
    <div
      key={c.id}
      onClick={() => onOpened(c.id)}
      className='flex flex-auto mb-3 p-2 hover:bg-gray-100 hover:cursor-pointer group'
    >
      {c.type === 'private' ? (
        <Avatar
          size='md'
          src={partner?.avatarUrl || ''}
          isOnline={partner?.isOnline || false}
          username={partner?.username}
          className='w-1/4'
        />
      ) : (
        <AvatarGroup>
          {members.map((m) => (
            <Avatar src={m.user.avatarUrl} username={m.user.username} />
          ))}
        </AvatarGroup>
      )}
      <div className='ml-3 flex-auto w-3/4'>
        <div className='flex justify-between flex-auto'>
          <div>{c.type === 'group' ? c.title : partner?.username}</div>
          <div className='text-gray-500 text-sm italic relative -bottom-[2px]'>
            {c.lastMessage
              ? t('common.ago', {
                  time: new Date(c.lastMessage.createdAt),
                })
              : null}
          </div>
        </div>
        <div className='flex flex-auto justify-between'>
          <div className='truncate mr-2'>
            {lastMessageSentByMe ? 'You: ' : ''}
            {c.lastMessage?.text}
          </div>
          <div className='flex justify-end relative'>
            <button
              className='opacity-0 group-hover:opacity-100 overflow-auto'
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenMenu((o) => !o);
              }}
            >
              <SvgSolidDots />
            </button>
            <div
              className={`absolute top-full right-0 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 ${
                isOpenMenu ? 'block' : 'hidden'
              }`}
            >
              {c.type === 'group' ? (
                <>
                  <li className='block py-2 px-4 text-gray-700 bg:white hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>
                    <a
                      className='block'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        leaveGroupConversation([c.id]);
                      }}
                      href='#'
                    >
                      Leave group
                    </a>
                  </li>
                  <li className='block py-2 px-4 text-gray-700 bg:white hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white'>
                    <a
                      className='block'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteGroupConversation([c.id]);
                      }}
                      href='#'
                    >
                      Delete group
                    </a>
                  </li>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
