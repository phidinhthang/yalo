import { dolma } from 'dolma';
// import md from 'markdown-it';
import { useGetCurrentConversation } from '../../lib/useGetCurrentConverrsation';

interface ChatMessageTextProps {
  text: string;
}

export const ChatMessageText = ({ text }: ChatMessageTextProps) => {
  const conversation = useGetCurrentConversation();
  const tokens = dolma.encode(text);

  return (
    <div className='inline-block dark:text-white'>
      {tokens.map(({ t, v }) => {
        if (t === 'text' || t === 'emote') {
          return v;
        } else if (t === 'mention') {
          const m = conversation?.members.find((m) => m.user.username === v);
          if (m) {
            return (
              <span className='text-blue-500 cursor-pointer'>
                @{m.user.username}
              </span>
            );
          } else {
            return `@${v}`;
          }
        } else if (t === 'link') {
          return (
            <a href={v} className='text-blue-500 underline' target='_blank'>
              {v}
            </a>
          );
        } else {
          return v;
        }
      })}
    </div>
  );
};
