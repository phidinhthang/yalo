import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarGroup } from '../../ui/Avatar';
import {
  useTypeSafeInfiniteQuery,
  useTypeSafeQuery,
} from '../../shared-hooks/useTypeSafeQuery';
import { useIsDesktopScreen } from '../../shared-hooks/useIsDesktopScreen';
import { useChatStore } from './useChatStore';
import { Member } from '../../lib/api/entities';
import React from 'react';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
import { SvgSolidArrowLeft } from '../../icons/SolidArrowLeft';
import { SvgSolidInfo } from '../../icons/SolidInfo';
import { ChatInfo } from './ChatInfo';
import { useOnClickOutside } from '../../shared-hooks/useOnClickOutside';
import { SvgSolidTrash } from '../../icons/SolidTrash';
import { ChatInputController } from './ChatInputController';
import { SvgOutlineUserAdd } from '../../icons/OutlineUserAdd';
import { SvgOutlinePencil } from '../../icons/OutlinePencil';
import { IconButton } from '../../ui/IconButton';
import { SvgOutlinePhotograph } from '../../icons/OutlinePhotograph';
import { MessageBox } from './MessageBox';
import { ChangeConversationTitleModal } from './ChangeConversationTitleModal';
import { AddMemberModal } from './AddMemberModal';
import { ChatSkeleton } from './ChatSkeletion';

export const ChatBox = () => {
  const { conversationOpened, setConversationOpened } = useChatStore();
  const [ref, inView] = useInView();
  const isDesktopScreen = useIsDesktopScreen();
  const navigate = useNavigate();
  const { t } = useTypeSafeTranslation();
  const [isChatInfoBoxOpen, setIsChatInfoBoxOpen] = React.useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);
  const [
    isChangeConversationTitleModalOpen,
    setIsChangeConversationTitleModalOpen,
  ] = React.useState(false);
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
  const { data: conversation } = useTypeSafeQuery(
    ['getConversation', conversationOpened!],
    { enabled: !!conversationOpened },
    [conversationOpened!]
  );
  const chatInfoRef = React.useRef<HTMLDivElement | null>(null);

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

  const partnerMember = conversation?.members.filter(
    (m) => m.user.id !== me?.id
  )?.[0];
  const partner = partnerMember?.user;
  const isGroup = conversation?.type === 'group';
  const memberMap: Record<number, Member> = {};

  conversation?.members.forEach((m) => {
    memberMap[m.user.id] = m;
  });

  React.useEffect(() => {
    if (!conversationOpened && !isDesktopScreen) {
      navigate('/conversations');
    }
  }, [conversationOpened, isDesktopScreen, navigate]);

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

  if (!conversation && !isLoading) return <>error</>;

  if (isLoading) {
    return <ChatSkeleton />;
  }

  return (
    <div className='relative flex flex-col h-full w-full'>
      <div className='border-b-2 dark:border-gray-700 px-2 py-3 flex w-full items-center justify-between'>
        <div className='flex items-center'>
          {!isDesktopScreen ? (
            <IconButton
              onClick={() => {
                navigate('/conversations');
                setConversationOpened(null);
              }}
            >
              <SvgSolidArrowLeft />
            </IconButton>
          ) : null}
          <div className='flex'>
            <AvatarGroup>
              {[
                ...(conversation?.type === 'group'
                  ? conversation.membersPreview || []
                  : [partner!] || []),
              ]?.map((user) => (
                <Avatar
                  key={user.id}
                  username={user.username}
                  src={user.avatarUrl}
                  size='md'
                />
              )) || []}
            </AvatarGroup>
            <div className='ml-2'>
              <p className='flex items-center gap-2 group h-6'>
                <b>{isGroup ? conversation.title : partner?.username}</b>
                <IconButton
                  onClick={() =>
                    setIsChangeConversationTitleModalOpen((o) => !o)
                  }
                >
                  <SvgOutlinePencil />
                </IconButton>
                {
                  <ChangeConversationTitleModal
                    isOpen={isChangeConversationTitleModalOpen}
                    setOpen={setIsChangeConversationTitleModalOpen}
                  />
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
            {conversation?.type === 'group' ? (
              <IconButton onClick={() => setIsAddMemberModalOpen((o) => !o)}>
                <SvgOutlineUserAdd />
              </IconButton>
            ) : null}
            <AddMemberModal
              isOpen={isAddMemberModalOpen}
              setOpen={setIsAddMemberModalOpen}
            />
            <IconButton
              onClick={() => {
                setIsChatInfoBoxOpen((o) => !o);
              }}
            >
              <SvgSolidInfo className='w-6 h-6' />
            </IconButton>
            {isChatInfoBoxOpen ? (
              <ChatInfo innerRef={chatInfoRef} conversation={conversation!} />
            ) : null}
          </div>
        </div>
      </div>
      <div className='flex-auto overflow-y-auto flex flex-col-reverse px-2 bg-gray-100 dark:bg-dark-300'>
        <div ref={endRef} style={{ float: 'left', clear: 'both' }}></div>
        {messages?.pages.map((page, p_idx) =>
          page.data.map((m, m_idx) => {
            return (
              <MessageBox
                message={m}
                pageIndex={p_idx}
                messageIndex={m_idx}
                key={m.id}
              />
            );
          })
        )}
        {hasNextPage ? <div ref={ref} className='pb-1'></div> : null}
      </div>
      <ChatInputController />
    </div>
  );
};
