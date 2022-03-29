import React from 'react';
import { EmojiMartItem } from '../types/types';
import {
  getImageEmoji,
  replaceAllTextEmojis,
  replaceAllTextEmojiToString,
} from './emoji';

export function handleCopy(event: React.ClipboardEvent) {
  const selectedText = window.getSelection();

  let container = document.createElement('div');

  for (let i = 0, len = selectedText!.rangeCount; i < len; ++i) {
    container.appendChild(selectedText!.getRangeAt(i).cloneContents());
  }

  container = replaceEmojiToString(container);

  event.clipboardData.setData('text', container.innerText);
  event.preventDefault();
}

export function handlePasteHtmlAtCaret(html: string) {
  let sel: any;
  let range;
  if (window.getSelection) {
    sel = window.getSelection();

    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();

      const el = document.createElement('div');
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}

function replaceEmojiToString(container: HTMLDivElement) {
  const images = Array.prototype.slice.call(container.querySelectorAll('img'));

  images.forEach((image) => {
    image.outerHTML = image.dataset.emoji;
  });

  return container;
}

export function handlePaste(event: React.ClipboardEvent) {
  event.preventDefault();
  let content;
  if (event.clipboardData) {
    content = event.clipboardData.getData('text/plain');
    content = replaceAllTextEmojis(content);
    document.execCommand('insertHTML', false, content);
  }
}

type HandleSelectEmojiProps = {
  emoji: EmojiMartItem;
  textInputRef: any;
  keepOpened: boolean;
  toggleShowPicker: () => void;
  maxLength: number;
};

export function handleSelectEmoji({
  emoji,
  textInputRef,
  keepOpened,
  toggleShowPicker,
  maxLength,
}: HandleSelectEmojiProps) {
  if (
    typeof maxLength !== 'undefined' &&
    totalCharacters(textInputRef.current) >= maxLength
  ) {
    return;
  }

  textInputRef.current.appendContent(getImageEmoji(emoji));

  if (!keepOpened) {
    toggleShowPicker();
  }
}

export function totalCharacters({
  text,
  html,
}: {
  text: string;
  html: string;
}) {
  const textCount = text.length;
  const emojisCount = (html.match(/<img/g) || []).length;

  return textCount + emojisCount;
}

export function handleKeyup(
  emitChange: () => void,
  onKeyDownMention: (event: KeyboardEvent) => void,
  cleanedTextRef: React.MutableRefObject<string>,
  textInputRef: React.MutableRefObject<HTMLDivElement>
) {
  return (event: KeyboardEvent) => {
    const text = replaceAllTextEmojiToString(textInputRef.current.innerHTML);
    cleanedTextRef.current = text;
    emitChange();
    onKeyDownMention(event);
  };
}

export function handleFocus(onFocus: (event: FocusEvent) => void) {
  return (event: FocusEvent) => {
    onFocus(event);
  };
}
