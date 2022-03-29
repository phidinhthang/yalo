import React, { useEffect, useState } from 'react';
import { EmojiMartItem, PolluteFn, SanitizeFn } from '../types/types';
import {
  getImageEmoji,
  replaceAllTextEmojis,
  replaceAllTextEmojiToString,
} from '../utils/emoji';

import EmojiPicker from './EmojiPicker';

type Props = {
  theme: 'light' | 'dark' | 'auto';
  keepOpened: boolean;
  disableRecent: boolean;
  addSanitizeFn: (fn: SanitizeFn) => void;
  addPolluteFn: (fn: PolluteFn) => void;
  appendContent: (html: string) => void;
};

const EmojiPickerWrapper = (props: Props) => {
  const {
    addPolluteFn,
    addSanitizeFn,
    appendContent,
    disableRecent,
    keepOpened,
    theme,
  } = props;
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    addSanitizeFn(replaceAllTextEmojiToString);
  }, [addSanitizeFn]);

  useEffect(() => {
    addPolluteFn(replaceAllTextEmojis as any);
  }, [addPolluteFn]);

  useEffect(() => {
    function checkClickOutside(event: MouseEvent) {
      const element = event.target as any;

      if (
        element.classList.contains('react-input-emoji--button') ||
        element.classList.contains('react-input-emoji--button--icon')
      ) {
        return;
      }

      setShowPicker(false);
    }

    document.addEventListener('click', checkClickOutside);

    return () => {
      document.removeEventListener('click', checkClickOutside);
    };
  }, []);

  function toggleShowPicker(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    setShowPicker((currentShowPicker) => !currentShowPicker);
  }

  function handleSelectEmoji(emoji: EmojiMartItem) {
    appendContent(getImageEmoji(emoji));

    if (!keepOpened) {
      setShowPicker((currentShowPicker) => !currentShowPicker);
    }
  }

  return (
    <>
      <div className='absolute top-0 w-full'>
        {showPicker && (
          <div
            className='absolute bottom-0 right-0 h-[357px] w-[338px] overflow-hidden z-10'
            onClick={(evt) => evt.stopPropagation()}
          >
            <div className='absolute top-0 left-0 react-emoji-picker'>
              <EmojiPicker
                theme={theme}
                onSelectEmoji={handleSelectEmoji}
                disableRecent={disableRecent}
                customEmojis={[]}
              />
            </div>
          </div>
        )}
      </div>
      <button
        type='button'
        className={`relative block text-center py-0 px-[10px] overflow-hidden m-0 shadow-none bg-none border-none outline-none cursor-pointer flex-shrink-0 .react-input-emoji--button ${
          showPicker ? ' react-input-emoji--button__show' : ''
        }`}
        onClick={toggleShowPicker}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          width='24'
          height='24'
          className='react-input-emoji--button--icon'
        >
          <path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10' />
          <path d='M8 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 8 7M16 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 16 7M15.232 15c-.693 1.195-1.87 2-3.349 2-1.477 0-2.655-.805-3.347-2H15m3-2H6a6 6 0 1 0 12 0' />
        </svg>
      </button>
    </>
  );
};

export default EmojiPickerWrapper;
