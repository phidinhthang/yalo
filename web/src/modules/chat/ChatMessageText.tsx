import { dolma } from 'dolma';
import React from 'react';
import { emojiMap } from './emojiData';
import md from 'markdown-it';
import { escapeHtml as e } from '../../utils/escapeHtml';

interface ChatMessageTextProps {
  text: string;
}

export const ChatMessageText = ({ text }: ChatMessageTextProps) => {
  const tokens = dolma.encode(text);

  let content = React.useMemo(() => {
    let acc: string[] = [];
    tokens.forEach(({ t, v }) => {
      if (t === 'text') {
        acc.push(e(v));
      } else if (t === 'emote') {
        if (v in emojiMap) {
          acc.push(
            `<span style="width: 36px; height: 36px; display: inline-block; margin: 0 4px; border-radius: 4px;">
              <img src="/emotes${e(emojiMap[v].imageUrl)}" alt="${e(
              emojiMap[v].name
            )}" style="width: 36px; height: 36px; object-fit: cover"/></span>`
          );
        } else {
          acc.push(`:${v}:`);
        }
      } else if (t === 'mention') {
        acc.push(`@${e(v)}`);
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
