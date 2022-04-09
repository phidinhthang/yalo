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
import { useGetCurrentConversation } from '../../lib/useGetCurrentConverrsation';
import { IconButton } from '../../ui/IconButton';
import { SvgOutlineTrash } from '../../icons/OutlineTrash';

type FileOrImagePreview =
  | { filename: string; mimeType: string; extension: string }
  | { dataUrl: string };

function getFileExtension(filename: string) {
  return (
    filename.substring(filename.lastIndexOf('.') + 1, filename.length) ||
    filename
  );
}

export const ChatInputController = () => {
  const { mutate: createMessage } = useTypeSafeMutation('createMessage');
  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { conversationOpened } = useChatStore();
  const conversation = useGetCurrentConversation();
  const members = conversation?.members;
  const { data: me } = useTypeSafeQuery('me');
  const ws = useWsStore().ws;
  const uploadFileInputRef = React.useRef<HTMLInputElement>(null);
  const emptyInputRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState('');
  const [filesOrImages, setFilesOrImages] = React.useState<File[]>([]);
  const [filesOrImagesPreview, setFilesOrImagesPreview] = React.useState<
    FileOrImagePreview[]
  >([]);
  React.useEffect(() => {
    setMessage('');
  }, [conversationOpened]);

  React.useEffect(() => {
    const promises: Promise<FileOrImagePreview>[] = [];
    filesOrImages.forEach((fileOrImage) => {
      if (fileOrImage.type.includes('image')) {
        const reader = new FileReader();
        promises.push(
          new Promise((res) => {
            reader.addEventListener('loadend', (e) => {
              res({ dataUrl: reader.result as string });
            });
          })
        );
        reader.readAsDataURL(fileOrImage);
      } else {
        promises.push(
          new Promise((res) => {
            res({
              filename: fileOrImage.name,
              mimeType: fileOrImage.type,
              extension: getFileExtension(fileOrImage.name),
            });
          })
        );
      }
    });
    Promise.all(promises).then((previews) => {
      setFilesOrImagesPreview(previews);
    });
  }, [filesOrImages]);

  const newTyping = throttle(() => {
    console.log('typing...');
    if (conversationOpened) {
      ws?.emit('typing', conversationOpened);
    }
  }, 2000);

  const sendMessage = () => {
    if (!message.length && !filesOrImages.length) return;

    createMessage(
      [
        {
          conversationId: conversationOpened!,
          text: message,
          images: filesOrImages,
        },
      ],
      {
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
          setFilesOrImages([]);
        },
      }
    );
  };

  return (
    <div className='flex flex-col'>
      <div>
        <div className=''>
          <div className='flex'>
            {/* {conversation?.typingMembers?.length
              ? `${typings[conversationOpened!].join(', ')} is typing...`
              : null} */}
            {conversation?.typingMembers
              ?.filter(
                (member, index, self) =>
                  index === self.findIndex((m) => m.user.id === member.user.id)
              )
              .map((member) => (
                <div>{member.user.username}</div>
              ))}
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
      <div>
        {filesOrImagesPreview.length ? (
          <div className='p-2'>
            <p className='pb-2'>
              {(() => {
                const numImagePreviews = filesOrImagesPreview.filter(
                  (p) => 'dataUrl' in p
                ).length;
                const numFilePreviews =
                  filesOrImagesPreview.length - numImagePreviews;
                const photoDisplay =
                  numImagePreviews === 1 ? 'photo' : 'photos';
                const fileDisplay = numFilePreviews === 1 ? 'file' : 'files';
                if (numImagePreviews && numFilePreviews) {
                  return `${numImagePreviews} ${photoDisplay} selected and ${numFilePreviews} ${fileDisplay} selected`;
                } else if (numFilePreviews && !numImagePreviews) {
                  return `${numFilePreviews} ${fileDisplay} selected`;
                } else if (numImagePreviews && !numFilePreviews) {
                  return `${numImagePreviews} ${photoDisplay} selected`;
                }
                return '';
              })()}
            </p>
            <div className='flex gap-1'>
              {filesOrImagesPreview.map((preview, index) => {
                let body = <img />;
                if ('dataUrl' in preview) {
                  body = (
                    <img
                      className='w-full h-full object-cover'
                      src={preview.dataUrl}
                    />
                  );
                } else {
                  body = (
                    <>
                      <img
                        className='w-full h-full object-cover'
                        src={`/file-icons/${preview.extension}.svg`}
                        onError={(e) => {
                          e.currentTarget.src = `/file-icons/unknown.svg`;
                        }}
                      />
                      <div className='absolute bottom-0 left-0 right-0 bg-gray-700 opacity-[0.75] text-center truncate'>
                        <p className='text-white opacity-100 p-1 text-sm'>
                          {preview.filename}
                        </p>
                      </div>
                    </>
                  );
                }
                return (
                  <div className='w-24 h-24 relative rounded-lg overflow-hidden'>
                    {/* {preview.filename} */}

                    {body}
                    <IconButton
                      className='absolute right-1 top-1 w-5 h-5 border border-gray-500'
                      onClick={() => {
                        setFilesOrImages((filesOrImages) =>
                          filesOrImages.filter((_, idx) => idx !== index)
                        );
                      }}
                    >
                      <SvgOutlineTrash />
                    </IconButton>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        <InputEmoji
          value={message}
          onChange={(message) => setMessage(message)}
          placeholder='Typing...'
          onEnter={() => {
            sendMessage();
          }}
          onKeyDown={() => {
            newTyping();
          }}
          onPaste={(e) => {
            console.log('paste ', e);
            const files = [...e.clipboardData.files];
            setFilesOrImages((previous) => [...previous, ...files]);
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
    </div>
  );
};
