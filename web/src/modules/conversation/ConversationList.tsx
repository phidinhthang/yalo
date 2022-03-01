import React from 'react';
import { Conversation } from '../../lib/entities';
import { User } from '../../lib/entities';
import { Avatar, AvatarGroup } from '../../ui/Avatar';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';

interface ConversationListProps {
  conversations: Conversation[];
  onOpened: (id: number) => void;
  me: Omit<User, 'password'>;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onOpened,
  me,
}) => {
  const { t } = useTypeSafeTranslation();
  return (
    <>
      {conversations.map((c) => {
        const partner = c.members.filter(
          (m) => m.user?.id !== undefined && m.user.id !== me!.id
        )[0]?.user;
        const members = c.members.filter((m) => m.user.id !== me.id);
        const lastMessageSentByMe = c.lastMessage?.creator === me.id;
        return (
          <div
            key={c.id}
            onClick={() => onOpened(c.id)}
            className='flex mb-3 p-2 hover:bg-gray-100 hover:cursor-pointer'
          >
            {c.type === 'private' ? (
              <Avatar
                size='md'
                src={partner?.avatarUrl || ''}
                isOnline={partner?.isOnline || false}
                username={partner?.username}
              />
            ) : (
              <AvatarGroup>
                {members.map((m) => (
                  <Avatar src={m.user.avatarUrl} username={m.user.username} />
                ))}
              </AvatarGroup>
            )}
            <div className='ml-3'>
              <div>{c.type === 'group' ? c.title : partner?.username}</div>
              <div className='flex'>
                <div className='truncate mr-2'>
                  {lastMessageSentByMe ? 'You: ' : ''}
                  {c.lastMessage?.text}
                </div>
                <div className='text-gray-500 text-sm italic relative -bottom-[2px]'>
                  {c.lastMessage
                    ? t('common.ago', {
                        time: new Date(c.lastMessage.createdAt),
                      })
                    : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
