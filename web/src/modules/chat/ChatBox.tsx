import { formatDistanceToNow } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Avatar, AvatarGroup } from '../../ui/Avatar';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import {
  useTypeSafeInfiniteQuery,
  useTypeSafeQuery,
} from '../../shared-hooks/useTypeSafeQuery';
import {
  useTypeSafeUpdateQuery,
  useTypeSafeUpdateInfiniteQuery,
} from '../../shared-hooks/useTypeSafeUpdateQuery';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useChatStore } from './useChatStore';
import { Member } from '../../lib/entities';
import React from 'react';
import { Skeleton } from '../../ui/Skeleton';
import { randomNumber } from '../../utils/randomNumber';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { SvgSolidArrowLeft } from '../../icons/SolidArrowLeft';
import { SvgSolidInfo } from '../../icons/SolidInfo';
import { ChatInfo } from './ChatInfo';
import { useOnClickOutside } from '../../shared-hooks/useOnClickOutside';
import { SvgSolidTrash } from '../../icons/SolidTrash';
import { ChatInput } from './ChatInput';
import { ChatMessageText } from './ChatMessageText';
import { SvgOutlineUserAdd } from '../../icons/OutlineUserAdd';
import { Modal } from '../../ui/Modal';
import { SvgOutlinePencil } from '../../icons/OutlinePencil';

const MainSkeleton = () => {
  const genHeight = () => randomNumber(3, 8) * 12;
  const genWidth = () => randomNumber(8, 24) * 18;
  return (
    <div className='h-screen overflow-y-auto'>
      {Array.from({ length: randomNumber(8, 12) }).map((_, idx) => {
        const isLeft = randomNumber(0, 1);
        return (
          <div
            key={idx}
            className={`px-2 flex gap-2 mb-2 ${
              isLeft ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <Skeleton circle className='w-14 h-14 rounded-full' />
            <div
              className={`flex flex-col flex-auto ${
                isLeft ? 'items-start' : 'items-end'
              }`}
            >
              <Skeleton className='h-7 w-36 mb-1' />
              <Skeleton
                style={{
                  height: genHeight(),
                  width: genWidth(),
                  maxWidth: '100%',
                }}
                className='px-2'
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ChatBox = () => {
  const { conversationOpened, setConversationOpened, typings } = useChatStore();
  const [ref, inView] = useInView();
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();
  const updateQuery = useTypeSafeUpdateQuery();
  const updateInfiniteQuery = useTypeSafeUpdateInfiniteQuery();
  const { t } = useTypeSafeTranslation();
  const [isChatInfoBoxOpen, setIsChatInfoBoxOpen] = React.useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);
  const [
    isChangeConversationTitleModalOpen,
    setIsChangeConversationTitleModalOpen,
  ] = React.useState(false);
  const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([]);
  const {
    data: messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useTypeSafeInfiniteQuery(
    ['getPaginatedMessages', conversationOpened!],
    {
      enabled: !!conversationOpened,
      getNextPageParam: (lastPage) => {
        if (!lastPage.nextCursor) return undefined;
        return lastPage;
      },
    },
    [{ conversationId: conversationOpened! }]
  );
  const { data: me } = useTypeSafeQuery('me');
  const { data: users } = useTypeSafeQuery('findAll');
  const { data: conversations } = useTypeSafeQuery('getPaginatedConversations');
  const conversation = conversations?.find((c) => c.id === conversationOpened);
  const { mutate: addMember } = useTypeSafeMutation('addMember');
  const { mutate: deleteMessage } = useTypeSafeMutation('deleteMessage');
  const { mutate: createMessage } = useTypeSafeMutation('createMessage');
  const { mutate: changeTitle, isLoading: isChangeTitleLoading } =
    useTypeSafeMutation('changeConversationTitle');
  const chatInfoRef = React.useRef<HTMLDivElement | null>(null);

  const [newTitle, setNewTitle] = React.useState<string>(
    conversation?.title || ''
  );

  React.useEffect(() => {
    setNewTitle(conversation?.title || '');
  }, [conversationOpened]);

  useOnClickOutside(chatInfoRef, () => {
    setIsChatInfoBoxOpen(false);
  });

  const endRef = React.useRef<HTMLDivElement>(null);

  if (inView && hasNextPage) {
    fetchNextPage();
  }

  React.useEffect(() => {
    if (!isLoading) {
      endRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [endRef.current, conversationOpened, isLoading]);

  const members = conversation?.members.filter((m) => m.user.id !== me?.id);
  const partner = members?.[0].user;
  const isGroup = conversation?.type === 'group';
  const memberMap: Record<number, Member> = {};
  const uploadFileInputRef = React.useRef<HTMLInputElement>(null);
  const emptyInputRef = React.useRef<HTMLInputElement>(null);

  conversation?.members.forEach((m) => {
    memberMap[m.user.id] = m;
  });
  if (!conversationOpened && !isDesktopScreen) {
    navigate('/conversations');
  }

  if (!conversationOpened) {
    return (
      <div className='h-full flex items-center justify-center text-center'>
        <div>
          <h2 className='text-2xl mb-3'>
            {t('common.welcome.to' as any)} <b>yalo!</b>
          </h2>
          <p className='w-full px-2 max-w-[480px] mx-auto'>
            {t('common.welcome.description1' as any)}
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) return <>error</>;

  if (isLoading) {
    return <MainSkeleton />;
  }

  return (
    <div className='relative flex flex-col h-full w-full'>
      <div className='border-b-2 dark:border-gray-700 px-2 py-3 flex w-full items-center justify-between'>
        <div className='flex items-center'>
          {!isDesktopScreen ? (
            <button
              className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 mr-2'
              onClick={() => {
                navigate('/conversations');
                setConversationOpened(null);
              }}
            >
              <SvgSolidArrowLeft />
            </button>
          ) : null}
          <div className='flex'>
            <AvatarGroup>
              {members?.map((m) => (
                <Avatar
                  key={m.user.id}
                  username={m.user.username}
                  src={m.user.avatarUrl}
                  size='md'
                />
              )) || []}
            </AvatarGroup>
            <div className='ml-2'>
              <p className='flex items-center gap-2 group h-6'>
                <b>{isGroup ? conversation.title : partner?.username}</b>
                <button
                  className='w-8 h-8 rounded-full hidden group-hover:flex items-center justify-center bg-gray-100'
                  onClick={() =>
                    setIsChangeConversationTitleModalOpen((o) => !o)
                  }
                >
                  <SvgOutlinePencil />
                </button>
                {
                  <Modal
                    isOpen={isChangeConversationTitleModalOpen}
                    title={'Set group name'}
                    onRequestClose={() => {
                      setIsChangeConversationTitleModalOpen(false);
                      setNewTitle(conversation?.title || '');
                    }}
                    footer={
                      <div className='flex flex-row-reverse w-full gap-3'>
                        <Button
                          onClick={() => {
                            changeTitle(
                              [conversationOpened!, { title: newTitle }],
                              {
                                onSuccess: (data) => {
                                  if (data) {
                                    console.log(
                                      'change conversation title ',
                                      data
                                    );
                                  }
                                  toast(
                                    'Change conversation title successfully!',
                                    { type: 'success' }
                                  );
                                  updateQuery(
                                    'getPaginatedConversations',
                                    (conversations) => {
                                      const conversation = conversations.find(
                                        (c) => c.id === conversationOpened
                                      );
                                      conversation!.title = newTitle;
                                      return conversations;
                                    }
                                  );
                                  setIsChangeConversationTitleModalOpen(false);
                                },
                                onError: (error) => {
                                  console.log(
                                    'change conversation title error ',
                                    error
                                  );
                                  toast(error.errors.title, { type: 'error' });
                                },
                              }
                            );
                          }}
                          disabled={newTitle.length === 0}
                          loading={isChangeTitleLoading}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant='secondary'
                          onClick={() => {
                            setIsChangeConversationTitleModalOpen(false);
                            setNewTitle(conversation?.title || '');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    }
                  >
                    <p>
                      Are you sure you want to rename this group, a new group
                      name will be visible with all members
                    </p>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </Modal>
                }
              </p>
              <p>
                {isGroup
                  ? `${conversation.members.length} members`
                  : partner?.isOnline
                  ? 'is online'
                  : `${t('common.ago', {
                      time: new Date(partner!.lastLoginAt!),
                    })}`}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className='flex items-center gap-2'>
            {conversation.type === 'group' ? (
              <button
                className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50'
                onClick={() => setIsAddMemberModalOpen((o) => !o)}
              >
                <SvgOutlineUserAdd />
              </button>
            ) : null}
            <Modal
              title='Add member'
              isOpen={isAddMemberModalOpen}
              onRequestClose={() => {
                setIsAddMemberModalOpen(false);
                setSelectedUserIds([]);
              }}
              footer={
                <div className='flex flex-row-reverse w-full gap-3'>
                  <Button
                    onClick={() => {
                      addMember([conversation.id, selectedUserIds], {
                        onSuccess: (newMembers) => {
                          console.log('new members', newMembers);
                          updateQuery(
                            'getPaginatedConversations',
                            (conversations) => {
                              const conversation = conversations?.find(
                                (c) => c.id === conversationOpened
                              );
                              conversation?.members.push(...newMembers);
                              return conversations;
                            }
                          );
                        },
                        onSettled: () => {
                          setIsAddMemberModalOpen(false);
                          setSelectedUserIds([]);
                        },
                      });
                    }}
                    disabled={selectedUserIds.length === 0}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setIsAddMemberModalOpen(false);
                      setSelectedUserIds([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              }
            >
              <div className='max-h-96 overflow-y-auto'>
                {users
                  ?.filter((u) => u.id !== me?.id)
                  .map((u) => {
                    const isMember = conversation.members.some(
                      (m) => m.user.id === u.id
                    );
                    return (
                      <label
                        key={u.id}
                        htmlFor={`add__member__${u.id}`}
                        className='flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer'
                      >
                        <input
                          id={`add__member__${u.id}`}
                          type='checkbox'
                          checked={
                            selectedUserIds.some((uId) => uId === u.id) ||
                            isMember
                          }
                          onChange={(e) => {
                            if (isMember) return;
                            if (e.target.checked) {
                              setSelectedUserIds((uIds) => [...uIds, u.id]);
                            } else {
                              setSelectedUserIds((uIds) =>
                                uIds.filter((id) => id !== u.id)
                              );
                            }
                          }}
                          className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                        ></input>
                        <Avatar
                          size='sm'
                          src={u.avatarUrl}
                          username={u.username}
                        />
                        <div>
                          <div>{u.username}</div>
                          {isMember ? (
                            <p className='text-gray-500 text-sm'>Đã tham gia</p>
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
              </div>
            </Modal>
            <button
              onClick={() => {
                setIsChatInfoBoxOpen((o) => !o);
              }}
              className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50'
            >
              <SvgSolidInfo className='w-6 h-6' />
            </button>
            {isChatInfoBoxOpen ? <ChatInfo ref={chatInfoRef} /> : null}
          </div>
        </div>
      </div>
      <div className='flex-auto overflow-y-auto flex flex-col-reverse px-2 bg-gray-100 dark:bg-dark-300'>
        <div ref={endRef} style={{ float: 'left', clear: 'both' }}></div>
        {messages?.pages.map((page, p_idx) =>
          page.data.map((m, m_idx) => {
            const isMsgSentByMe = m.creator === me?.id;
            const seenMembers = members
              ?.filter(
                (mb) =>
                  mb.user.id !== me?.id &&
                  mb.user.id !== m.creator &&
                  mb?.lastReadAt &&
                  new Date(mb.lastReadAt) > new Date(m.createdAt)
              )
              .map((mb) => mb.user.username);
            const seenMembersDisplay = seenMembers?.slice(0, 2);
            const seenText = seenMembersDisplay?.length
              ? seenMembers?.length === seenMembersDisplay?.length
                ? `${seenMembersDisplay?.join(', ')} seen`
                : `${seenMembersDisplay?.join(', ')} and ${
                    seenMembers!.length - seenMembersDisplay!.length
                  } other seen`
              : '';

            return (
              <div
                key={m.id}
                className={`flex my-2 gap-3 w-full ${
                  isMsgSentByMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div>
                  <Avatar
                    size='sm'
                    src={memberMap[m.creator].user.avatarUrl}
                    username={memberMap[m.creator].user.username}
                  />
                </div>

                <div
                  className={`bg-white dark:bg-dark-200 break-all rounded-lg relative p-2 group ${
                    isMsgSentByMe ? 'text-right' : ''
                  }`}
                  style={{ maxWidth: 'calc(100% - 132px)' }}
                >
                  <p>
                    {m.isDeleted ? (
                      <span className='italic text-gray-500 dark:text-white'>
                        {t('message.deleted')}
                      </span>
                    ) : m.text ? (
                      <ChatMessageText text={m.text!} />
                    ) : null}
                    {m.images ? (
                      <div className='flex gap-2'>
                        {m.images.map((i, idx) => (
                          <img src={i.url} className='w-52 object-cover' />
                        ))}
                      </div>
                    ) : null}
                  </p>
                  <div className='flex'>
                    <div className='flex-grow'></div>
                    <p className='text-sm italic text-gray-500 dark:text-gray-300'>
                      {formatDistanceToNow(new Date(m.createdAt))}
                    </p>
                    {seenText && p_idx === 0 && m_idx === 0 ? (
                      <p className='text-sm italic text-gray-500 ml-3'>
                        {seenText}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className={`absolute bottom-0 right-full w-20 h-16 bg-pink hidden group-hover:flex items-center justify-center ${
                      isMsgSentByMe ? 'right-full' : 'left-full'
                    }`}
                  >
                    <div>
                      <button
                        className='w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-dark-500 border dark:border-dark-900 hover:bg-gray-100'
                        onClick={() => {
                          deleteMessage([m.id], {
                            onSuccess: () => {
                              updateInfiniteQuery(
                                ['getPaginatedMessages', conversationOpened],
                                (messages) => {
                                  messages?.pages.forEach((p) =>
                                    p.data.forEach((msg) => {
                                      if (msg.id === m.id) msg.isDeleted = true;
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
                                    if (c.lastMessage?.id === m.id) {
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
                        <SvgSolidTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {hasNextPage ? <div ref={ref} className='pb-1'></div> : null}
      </div>
      <div>
        <div className=''>
          <div>
            {typings[conversationOpened]?.length
              ? `${typings[conversationOpened].join(', ')} is typing...`
              : null}
          </div>
          <div className='border h-12'>
            <div>
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
                          conversationId: conversationOpened,
                        },
                      ],
                      {
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
                onClick={() => {
                  uploadFileInputRef.current?.click();
                }}
              >
                upload
              </Button>
            </div>
          </div>
        </div>
        <ChatInput />
      </div>
    </div>
  );
};
