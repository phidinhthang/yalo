import * as React from 'react';
import { useLocation } from 'react-router-dom';
import throttle from 'lodash.throttle';

import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useChatStore } from './useChatStore';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { SvgSolidHappy } from '../../icons/SolidHappy';
import { SvgSolidPaperAirplane } from '../../icons/SolidPaperAirplane';
import {
  useTypeSafeUpdateInfiniteQuery,
  useTypeSafeUpdateQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
import { useWsStore } from '../auth/useWsStore';
import InputEmoji from '../../lib/react-input-emoji/InputEmoji';
import { Button } from '../../ui/Button';
import { SvgOutlinePhotograph } from '../../icons/OutlinePhotograph';

export const ChatInputController = () => {
  const { mutate: createMessage } = useTypeSafeMutation('createMessage');
  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { conversationOpened, typings } = useChatStore();
  const { data: conversation } = useTypeSafeQuery(
    ['getConversation', conversationOpened!],
    { enabled: !!conversationOpened }
  );
  const members = conversation?.members;
  const { data: me } = useTypeSafeQuery('me');
  const ws = useWsStore().ws;
  const uploadFileInputRef = React.useRef<HTMLInputElement>(null);
  const emptyInputRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState('');
  React.useEffect(() => {
    setMessage('');
  }, [conversationOpened]);

  const newTyping = throttle(() => {
    console.log('typing...');
    if (conversationOpened) {
      ws?.emit('typing', conversationOpened);
    }
  }, 2000);

  const sendMessage = () => {
    if (!message.length) return;

    createMessage([{ conversationId: conversationOpened!, text: message }], {
      onSuccess: (data) => {
        if (typeof data === 'boolean') return;
        if (!('id' in data)) return;
        updateInfiniteQuery(
          ['getPaginatedMessages', conversationOpened!],
          (messages) => {
            if (!messages) return messages;
            messages.pages[0].data.unshift(data);
            return messages;
          }
        );
        updateQuery('getPaginatedConversations', (conversations) => {
          conversations
            ?.filter((c) => c.id === data.conversation)
            .map((c) => {
              c.lastMessage = data;
              return c;
            });

          return conversations;
        });
        setMessage('');
      },
    });
  };

  return (
    <div className='flex flex-col'>
      <div>
        <div className=''>
          <div>
            {typings[conversationOpened!]?.length
              ? `${typings[conversationOpened!].join(', ')} is typing...`
              : null}
          </div>
          <div className='border h-12 dark:border-gray-700'>
            <div className='h-full flex items-center'>
              <input
                hidden
                ref={uploadFileInputRef}
                type='file'
                multiple
                onChange={(e) => {
                  console.log('e.target.files', e.target.files);
                  if (e.target.files?.length) {
                    createMessage(
                      [
                        {
                          images: Array.from(e.target.files),
                          conversationId: conversationOpened!,
                        },
                      ],
                      {
                        onSuccess: (message) => {
                          updateInfiniteQuery(
                            ['getPaginatedMessages', conversation!.id],
                            (messages) => {
                              messages.pages[0].data.unshift(message);
                              return messages;
                            }
                          );
                        },
                        onSettled: () => {
                          e.target.files = emptyInputRef.current!.files;
                        },
                      }
                    );
                  }
                }}
              />
              <input hidden ref={emptyInputRef} multiple />
              <Button
                variant='secondary'
                size='sm'
                className='ml-2'
                onClick={() => {
                  uploadFileInputRef.current?.click();
                }}
              >
                <SvgOutlinePhotograph />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <InputEmoji
        value={message}
        onChange={(message) => setMessage(message)}
        placeholder='Typing...'
        onEnter={() => {
          sendMessage();
        }}
        searchMention={async (text) => {
          if (!text) {
            return [];
          }
          console.log('memser ', members);
          const filteredText = text.substring(1).toLocaleLowerCase();

          return (
            members
              ?.filter((member) => {
                if (
                  member.user.username
                    .toLocaleLowerCase()
                    .startsWith(filteredText) &&
                  member.user.id !== me?.id
                ) {
                  return true;
                }
              })
              .map((member) => ({
                id: member.user.id + '',
                name: member.user.username,
                image: member.user.avatarUrl!,
              })) || []
          );
        }}
        buttonGroup={<button>ok</button>}
      />
    </div>
  );
};
