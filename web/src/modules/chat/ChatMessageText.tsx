import { dolma } from 'dolma';
import React from 'react';
import md from 'markdown-it';
import { escapeHtml as e } from '../../utils/escapeHtml';
import { useGetCurrentConversation } from '../../lib/useGetCurrentConverrsation';

interface ChatMessageTextProps {
  text: string;
}

export const ChatMessageText = ({ text }: ChatMessageTextProps) => {
  const conversation = useGetCurrentConversation();
  const tokens = dolma.encode(text);

  let content = React.useMemo(() => {
    let acc: string[] = [];
    tokens.forEach(({ t, v }) => {
      if (t === 'text' || t === 'emote') {
        acc.push(e(v));
      } else if (t === 'mention') {
        const m = conversation?.members.find((m) => m.user.username === v);
        if (m) {
          acc.push(
            `<span style="color: blue; cursor: pointer">@${m.user.username}</span>`
          );
        } else {
          acc.push(`@${v}`);
        }
      } else if (t === 'link') {
        acc.push(
          `<a href="${e(
            v
          )}" style="color: blue; text-decoration: underline" target="_blank">${e(
            v
          )}</a>`
        );
      } else {
        acc.push(e(v));
      }
    });

    return acc.join(' ');
  }, [text]);

  return (
    <div
      className='inline-block dark:text-white'
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
