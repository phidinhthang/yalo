import { formatDistanceToNow } from 'date-fns';
import { t } from 'i18next';
import React from 'react';
import { SvgOutlineHappy } from '../../icons/OutlineHappy';
import { SvgOutlineTrash } from '../../icons/OutlineTrash';
import { SvgSolidTrash } from '../../icons/SolidTrash';
import { Member, Message } from '../../lib/api/entities';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import {
  useTypeSafeUpdateInfiniteQuery,
  useTypeSafeUpdateQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar } from '../../ui/Avatar';
import { IconButton } from '../../ui/IconButton';
import { ReactionPicker } from '../../ui/Reaction/ReactionPicker';
import { ChatMessageText } from './ChatMessageText';
import { useChatStore } from './useChatStore';

interface MessageBoxProps {
  message: Message;
  pageIndex: number;
  messageIndex: number;
}

export const MessageBox = ({
  message,
  messageIndex,
  pageIndex,
}: MessageBoxProps) => {
  const [showReactionPicker, setShowReactionPicker] = React.useState(false);
  const { mutate: deleteMessage } = useTypeSafeMutation('deleteMessage');
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const updateQuery = useTypeSafeUpdateQuery();
  const { data: me } = useTypeSafeQuery('me');
  const { conversationOpened } = useChatStore();
  const { data: conversation } = useTypeSafeQuery([
    'getConversation',
    conversationOpened!,
  ]);
  const membersExceptMe = conversation?.members.filter(
    (m) => m.user.id !== me?.id
  );
  const memberMap: Record<number, Member> = {};

  conversation?.members.forEach((m) => {
    memberMap[m.user.id] = m;
  });
  const isMsgSentByMe = message.creator === me?.id;
  const seenMembers = membersExceptMe?.filter(
    (mb) =>
      mb.user.id !== me?.id &&
      mb.user.id !== message.creator &&
      mb?.lastReadAt &&
      new Date(mb.lastReadAt) > new Date(message.createdAt)
  );
  return (
    <div
      className={`flex my-2 gap-3 w-full ${
        isMsgSentByMe ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div>
        <Avatar
          size='sm'
          src={memberMap[message.creator].user.avatarUrl}
          username={memberMap[message.creator].user.username}
        />
      </div>
      <div style={{ maxWidth: 'calc(100% - 132px)' }} className='flex flex-col'>
        <div
          className={`bg-white dark:bg-dark-200 break-all rounded-lg relative p-2 group ${
            isMsgSentByMe ? 'text-right' : ''
          }`}
        >
          <p>
            {message.isDeleted ? (
              <span className='italic text-gray-500 dark:text-white'>
                {t('message.deleted')}
              </span>
            ) : message.text ? (
              <ChatMessageText text={message.text!} />
            ) : null}
            {message.images ? (
              <div className='flex gap-2'>
                {message.images.map((i, idx) => (
                  <img src={i.url} className='w-52 object-cover' />
                ))}
              </div>
            ) : null}
          </p>
          <div className='flex'>
            <div className='flex-grow'></div>
            <p className='text-sm italic text-gray-500 dark:text-gray-300'>
              {formatDistanceToNow(new Date(message.createdAt))}
            </p>
          </div>
          <div
            className={`absolute bottom-0 right-full w-20 h-16 bg-pink hidden group-hover:flex items-center justify-center ${
              isMsgSentByMe ? 'right-full' : 'left-full'
            }`}
          >
            <div className='flex gap-2'>
              <IconButton
                className='w-6 h-6'
                onClick={() => {
                  deleteMessage([message.id], {
                    onSuccess: () => {
                      updateInfiniteQuery(
                        ['getPaginatedMessages', conversationOpened!],
                        (messages) => {
                          messages?.pages.forEach((p) =>
                            p.data.forEach((msg) => {
                              if (msg.id === message.id) msg.isDeleted = true;
                              return msg;
                            })
                          );
                          return messages;
                        }
                      );
                      updateQuery(
                        'getPaginatedConversations',
                        (conversations) => {
                          conversations?.forEach((c) => {
                            if (c.lastMessage?.id === message.id) {
                              c.lastMessage.text = '';
                              c.lastMessage.isDeleted = true;
                            }
                          });
                          return conversations;
                        }
                      );
                    },
                  });
                }}
              >
                <SvgOutlineTrash />
              </IconButton>
              <IconButton
                className='w-6 h-6 relative'
                onClick={() => setShowReactionPicker((s) => !s)}
              >
                <SvgOutlineHappy />
                {showReactionPicker ? (
                  <div className='absolute bottom-full z-20'>
                    <ReactionPicker
                      iconSize={24}
                      reactions={[
                        'like',
                        'love',
                        'haha',
                        'wow',
                        'sad',
                        'angry',
                      ]}
                      onSelect={(label) => {
                        console.log('label ', label);
                      }}
                    />
                  </div>
                ) : null}
              </IconButton>
            </div>
          </div>
        </div>
        {pageIndex === 0 && messageIndex === 0 && seenMembers?.length ? (
          <div className='flex gap-[2px] justify-end mt-1'>
            {seenMembers?.map((m) => (
              <Avatar
                size='xxxs'
                key={m.user.id}
                src={m.user.avatarUrl}
                username={m.user.username}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
