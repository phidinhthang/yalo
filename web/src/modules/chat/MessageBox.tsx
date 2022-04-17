import { formatDistanceToNow } from 'date-fns';
import { t } from 'i18next';
import React from 'react';
import { SvgOutlineDownload } from '../../icons/OutlineDownload';
import { SvgOutlineHappy } from '../../icons/OutlineHappy';
import { SvgOutlineTrash } from '../../icons/OutlineTrash';
import { SvgSolidReply } from '../../icons/SolidReply';
import { SvgSolidTrash } from '../../icons/SolidTrash';
import { Member, Message } from '../../lib/api/entities';
import { downloadFile } from '../../lib/downloadFile';
import { getFileExtension } from '../../lib/getFileExtension';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import {
  useTypeSafeUpdateInfiniteQuery,
  useTypeSafeUpdateQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar } from '../../ui/Avatar';
import { IconButton } from '../../ui/IconButton';
import { ReactionPicker } from '../../ui/Reaction/ReactionPicker';
import { ReactionStats } from '../../ui/Reaction/ReactionStats';
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
  const { mutate: reactsToMessage } = useTypeSafeMutation('reactsToMessage');
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const updateQuery = useTypeSafeUpdateQuery();
  const { data: me } = useTypeSafeQuery('me');
  const { conversationOpened, setReplyTo } = useChatStore();
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
  const numReactions = Object.values(message.numReactions).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const usedReactions = Object.keys(message.numReactions).filter(
    (r) =>
      //@ts-ignore
      message.numReactions[r] !== undefined && message.numReactions[r] !== 0
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
          className={`bg-white dark:bg-dark-primary break-all rounded-lg relative p-2 group ${
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
            {message.images && !message.isDeleted ? (
              <div className='flex gap-2'>
                {message.images.map((i, idx) => (
                  <img src={i.url} className='w-52 object-cover' />
                ))}
              </div>
            ) : null}
            {message.files && !message.isDeleted ? (
              <div>
                {message.files.map((f) => (
                  <div className='flex justify-between'>
                    <div className='flex gap-2'>
                      <div className='w-14 h-14'>
                        <img
                          className='object-cover w-full h-full'
                          src={`/file-icons/${getFileExtension(
                            f.fileName
                          )}.svg`}
                          onError={(e) => {
                            e.currentTarget.src = `/file-icons/unknown.svg`;
                          }}
                        />
                      </div>
                      <div>
                        <p>{f.fileName}</p>
                        <p>{Math.round((f.fileSize / 1024) * 10) / 10} kb</p>
                      </div>
                    </div>
                    <div>
                      <IconButton
                        onClick={() => {
                          downloadFile(f.url, f.fileName);
                        }}
                      >
                        <SvgOutlineDownload />
                      </IconButton>
                    </div>
                  </div>
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
            className={`absolute bottom-0 right-full w-24 h-16 bg-pink hidden group-hover:flex items-center justify-center ${
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
                className='w-6 h-6'
                onClick={() => {
                  setReplyTo(message.id);
                }}
              >
                <SvgSolidReply />
              </IconButton>
              <div className='relative'>
                <IconButton
                  className='w-6 h-6'
                  onClick={() => setShowReactionPicker((s) => !s)}
                >
                  <SvgOutlineHappy />
                </IconButton>
                {showReactionPicker ? (
                  <div className='absolute bottom-full z-20 right-1/2 transform translate-x-1/2'>
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
                      picked={message.reaction}
                      onSelect={(label) => {
                        reactsToMessage(
                          [
                            message.id,
                            label,
                            message.reaction !== label ? 'create' : 'remove',
                          ],
                          {
                            onSuccess: () => {
                              updateInfiniteQuery(
                                ['getPaginatedMessages', message.conversation],
                                (messages) => {
                                  messages.pages.forEach((page) => {
                                    page.data.forEach((m) => {
                                      if (m.id === message.id) {
                                        m.numReactions = {
                                          ...m.numReactions,
                                          [label]:
                                            message.reaction === label
                                              ? (m.numReactions[label] ?? 1) - 1
                                              : (m.numReactions[label] ?? 0) +
                                                1,
                                        };

                                        if (
                                          message.reaction &&
                                          message.reaction !== label
                                        ) {
                                          m.numReactions[message.reaction] =
                                            (m.numReactions[message.reaction] ??
                                              1) - 1;
                                        }
                                        m.reaction =
                                          m.reaction === label
                                            ? undefined
                                            : label;
                                      }
                                    });
                                  });
                                  return messages;
                                }
                              );
                            },
                          }
                        );
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {usedReactions.length ? (
          <div className='relative flex justify-end'>
            <div className='-mt-3 -mb-1'>
              <ReactionStats
                numReactions={numReactions}
                reactions={usedReactions as any}
              />
            </div>
          </div>
        ) : null}
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
