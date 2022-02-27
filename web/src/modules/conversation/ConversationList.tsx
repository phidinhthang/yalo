import React from 'react';
import { Conversation } from '../../lib/entities';
import { User } from '../../lib/entities';
import { Avatar } from '../../ui/Avatar';
import { formatDistance } from 'date-fns';

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
  return (
    <>
      {conversations.map((c) => {
        const partner = c.members.filter(
          (m) => m.user?.id !== undefined && m.user.id !== me!.id
        )[0]?.user;
        const lastMessageSentByMe = c.lastMessage?.creator === me.id;
        return (
          <div
            key={c.id}
            onClick={() => onOpened(c.id)}
            className='flex mb-3 p-2 hover:bg-gray-100 hover:cursor-pointer'
          >
            <Avatar
              size='md'
              src={partner?.avatarUrl || ''}
              isOnline={partner?.isOnline || false}
              username={partner?.username}
            />
            <div className='ml-3'>
              <div>{partner?.username}</div>
              <div className='flex'>
                <div className='truncate mr-2'>
                  {lastMessageSentByMe ? 'You: ' : ''}
                  {c.lastMessage?.text}
                </div>
                <div className='text-gray-500 text-sm italic relative -bottom-[2px]'>
                  {c.lastMessage
                    ? formatDistance(
                        new Date(c.lastMessage!.createdAt),
                        new Date(),
                        { addSuffix: true /* locale: vi */ }
                      )
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
