import React from 'react';
import { SvgOutlineDuplicate } from '../../icons/OutlineDuplicate';
import { SvgOutlineUserAdd } from '../../icons/OutlineUserAdd';
import { SvgSolidArrowLeft } from '../../icons/SolidArrowLeft';
import { SvgSolidDots } from '../../icons/SolidDots';
import { Conversation, Member, User } from '../../lib/api/entities';
import { useCopyToClipboard } from '../../shared-hooks/useCopyToClipboard';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Avatar, AvatarGroup } from '../../ui/Avatar';
import { IconButton } from '../../ui/IconButton';

interface ChatInfoProps {
  conversation: Conversation;
  innerRef: React.LegacyRef<HTMLDivElement>;
}

export const ChatInfo = ({ conversation, innerRef }: ChatInfoProps) => {
  const [isMemberInfoSectionOpen, setIsMemberInfoSectionOpen] =
    React.useState(false);
  const { data: me } = useTypeSafeQuery('me');
  const admin = conversation.admin;
  const inviteLink = `${window.location.host}/g/${conversation.inviteLinkToken}`;
  const [copied, copyInviteLink] = useCopyToClipboard();
  const [showCopiedTooltip, setShowCopiedTooltip] = React.useState(false);
  const [clickedCount, setClickCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (copied && clickedCount) {
      setShowCopiedTooltip(true);
      setTimeout(() => {
        setShowCopiedTooltip(false);
      }, 1000);
    }
  }, [copied, clickedCount]);

  if (conversation.type === 'private') return <></>;

  const body = !isMemberInfoSectionOpen ? (
    <>
      <div className='text-center text-xl font-semibold pt-3 pb-5 border-b dark:border-gray-700'>
        Group Info
      </div>
      <div className='flex flex-col gap-3 items-center p-3 border-b dark:border-gray-700'>
        <AvatarGroup>
          {conversation.members.map((m) => (
            <Avatar
              src={m.user.avatarUrl}
              username={m.user.username}
              key={m.user.id}
            />
          ))}
        </AvatarGroup>
        <p className='font-bold'>{conversation.title}</p>
      </div>
      <div className='p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-dark-300 cursor-pointer'>
        <div className='flex justify-between'>
          <p
            className='hover:cursor-pointer hover:underline'
            onClick={() => {
              setIsMemberInfoSectionOpen(true);
            }}
          >
            {conversation.members.length} members
          </p>
          <IconButton>
            <SvgOutlineUserAdd />
          </IconButton>
        </div>
      </div>
      <div className='p-4 border-b dark:border-gray-700 flex justify-between hover:bg-gray-100 dark:hover:bg-dark-300 cursor-pointer'>
        <div>
          <p>Group link</p>
          <p className='text-blue-500 text-sm'>{inviteLink}</p>
        </div>
        <div className='relative'>
          <IconButton
            onClick={() => {
              copyInviteLink(inviteLink);
              setClickCount((c) => c + 1);
            }}
          >
            <SvgOutlineDuplicate />
          </IconButton>
          {showCopiedTooltip ? (
            <div className='bg-dark-500 text-white rounded-md px-3 py-2 absolute top-full right-0'>
              Copied
            </div>
          ) : null}
        </div>
      </div>
    </>
  ) : (
    <>
      <div className='flex gap-2 items-center p-3'>
        <IconButton
          onClick={() => {
            setIsMemberInfoSectionOpen(false);
          }}
        >
          <SvgSolidArrowLeft />
        </IconButton>
        <p>Members</p>
      </div>
      <div className='flex flex-col'>
        {conversation.members.map((m) => (
          <MemberItem m={m} me={me!} key={m.user.id} admin={admin! as any} />
        ))}
      </div>
    </>
  );

  return (
    <div
      className='fixed top-0 right-0 bottom-0 w-[336px] z-50 border dark:border-gray-700 bg-white dark:bg-dark-900'
      ref={innerRef as any}
    >
      {body}
    </div>
  );
};

const MemberItem = ({
  m,
  me,
  admin,
}: {
  m: Member;
  me: Omit<User, 'password'>;
  admin: { id: number };
}) => {
  const { mutate: kickMember } = useTypeSafeMutation('kickMember');
  const updateQuery = useTypeSafeUpdateQuery();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isMe = m.user.id === me.id;
  const isAdmin = m.user.id === admin.id;
  const canKick = me.id === admin.id && m.user.id !== me.id;
  const conversationId =
    // @ts-ignore
    typeof m.conversation === 'number' ? m.conversation : m.conversation.id;

  return (
    <div className='flex py-2 px-3 hover:bg-gray-50 dark:hover:bg-dark-500 group'>
      <Avatar
        size='md'
        src={m.user.avatarUrl || ''}
        username={m.user.username}
      />
      <div className='ml-3 flex-1'>
        <div>
          {m.user.username} {isMe ? '(You)' : null}
        </div>
        <div>{isAdmin ? 'admin' : 'member'}</div>
      </div>
      <div className='relative self-start'>
        <button
          className='opacity-0 group-hover:opacity-100 overflow-auto'
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((o) => !o);
          }}
        >
          <SvgSolidDots />
        </button>
        <div
          className={`absolute top-full z-50 right-0 w-44 text-base list-none bg-white dark:bg-gray-700 rounded divide-y divide-gray-100 shadow ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
        >
          {canKick ? (
            <li className='block py-2 px-4 w-full h-full text-gray-700 bg-white dark:bg-dark-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white'>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('kick member id ', m.user.id, typeof m.user.id);
                  kickMember([conversationId, m.user.id], {
                    onSuccess: () => {
                      updateQuery(['getConversation', conversationId], (c) => {
                        if (!c) return undefined;
                        c.members = c?.members?.filter(
                          (_m) => m.user.id !== _m.user.id
                        );
                        return c as any;
                      });
                    },
                    onSettled: () => setIsMenuOpen(false),
                  });
                }}
              >
                kick user
              </a>
            </li>
          ) : null}
          {isMe ? (
            <li className='block py-2 px-4 w-full h-full text-gray-700 bg-white dark:bg-dark-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white'>
              <a>leave group</a>
            </li>
          ) : null}
        </div>
      </div>
    </div>
  );
};
