import React, { useEffect, useRef, forwardRef, useCallback } from 'react';
import { replaceAllTextEmojis } from './utils/emoji';
import { totalCharacters } from './utils/inputEvent';

import TextInput, { Ref } from './TextInput';
import EmojiPickerWrapper from './components/EmojiPickerWrapper';
import MentionWrapper from './components/MentionWrapper';
import { useEventListeners } from './hooks/useEventListeners';
import { useSanitize } from './hooks/useSanitize';
import { usePollute } from './hooks/usePollute';
import { MentionUser } from './types/types';

import './style.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  cleanOnEnter?: boolean;
  onEnter?: (text: string) => void;
  placeholder?: string;
  onClick?: () => void;
  onFocus?: () => void;
  maxLength?: number;
  keepOpened?: boolean;
  onKeyDown?: (event: KeyboardEvent) => void;
  inputClass?: string;
  disableRecent?: boolean;
  tabIndex?: number;
  searchMention: (text: string) => Promise<MentionUser[]>;
  buttonGroup?: React.ReactNode;
};
function InputEmoji(props: Props, ref: React.Ref<any>) {
  const {
    onChange,
    onEnter,
    onClick,
    onFocus,
    onKeyDown,
    theme,
    cleanOnEnter,
    placeholder,
    maxLength,
    keepOpened,
    inputClass,
    disableRecent,
    tabIndex,
    value,
    searchMention,
    buttonGroup = <div />,
  } = props;

  const textInputRef = useRef<Ref>(null);
  const [isFocus, setFocus] = React.useState(false);
  const { addEventListener, listeners } = useEventListeners();
  const { addSanitizeFn, sanitize, sanitizedTextRef } = useSanitize();
  const { addPolluteFn, pollute } = usePollute();

  const updateHTML = useCallback(
    (nextValue = '') => {
      textInputRef.current!.html! = replaceAllTextEmojis(nextValue);
      sanitizedTextRef.current! = nextValue;
    },
    [sanitizedTextRef]
  );

  const setValue = useCallback(
    (value) => {
      updateHTML(value);
    },
    [updateHTML]
  );

  useEffect(() => {
    if (sanitizedTextRef.current !== value) {
      setValue(value);
    }
  }, [sanitizedTextRef, setValue, value]);

  useEffect(() => {
    updateHTML();
  }, [updateHTML]);

  useEffect(() => {
    function handleKeydown(event: React.KeyboardEvent) {
      if (
        typeof maxLength !== 'undefined' &&
        event.key !== 'Backspace' &&
        totalCharacters(textInputRef!.current!) >= maxLength
      ) {
        event.preventDefault();
      }

      if (event.key === 'Enter') {
        event.preventDefault();

        const text = sanitize(textInputRef.current!.html);

        onChange(sanitizedTextRef.current);

        if (listeners.enter.currentListeners.length === 0) {
          onEnter?.(text);
        }
        if (cleanOnEnter && listeners.enter.currentListeners.length === 0) {
          updateHTML('');
        }
        onKeyDown?.(event.nativeEvent);
        return false;
      }
      onKeyDown?.(event.nativeEvent);

      return true;
    }

    return addEventListener('keyDown', handleKeydown);
  }, [
    addEventListener,
    cleanOnEnter,
    onChange,
    listeners.enter.currentListeners.length,
    maxLength,
    onEnter,
    onKeyDown,
    sanitize,
    sanitizedTextRef,
    updateHTML,
  ]);

  useEffect(() => {
    function handleFocus() {
      onClick?.();
      onFocus?.();
      setFocus(true);
    }

    return addEventListener('focus', handleFocus);
  }, [addEventListener, onClick, onFocus, setFocus]);

  function handleTextInputChange(html: string) {
    sanitize(html);
    onChange(sanitizedTextRef.current);
  }

  function appendContent(html: string) {
    if (maxLength && totalCharacters(textInputRef.current!) >= maxLength) {
      return;
    }
    textInputRef.current?.appendContent(html);
  }

  function handleCopy(event: React.ClipboardEvent) {
    event.clipboardData.setData('text', sanitizedTextRef.current);
    event.preventDefault();
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    if (event.clipboardData) {
      let content = event.clipboardData.getData('text/plain');
      content = pollute(content);
      document.execCommand('insertHTML', false, content);
    }
  }

  return (
    <div className='flex items-center relative w-full'>
      <MentionWrapper
        searchMention={searchMention}
        addEventListener={addEventListener}
        appendContent={appendContent}
        addSanitizeFn={addSanitizeFn}
      />
      <div
        className={`bg-white w-full outline-none font-[400] pl-[5px] py-[5px] leading-[20px] flex items-center border-t dark:bg-gray-700 dark:text-white${
          isFocus
            ? 'ring-blue-500 border-blue-500 dark:ring-blue-500 dark:border-blue-500'
            : 'border-gray-300 dark:bg-gray-700'
        }`}
      >
        {/* @ts-ignore */}
        <TextInput
          ref={textInputRef}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onFocus={listeners.focus.publish}
          onBlur={() => {
            setFocus(false);
          }}
          onArrowUp={listeners.arrowUp.publish}
          onArrowDown={listeners.arrowDown.publish}
          onKeyUp={listeners.keyUp.publish}
          onKeyDown={listeners.keyDown.publish}
          onEnter={listeners.enter.publish}
          placeholder={placeholder!}
          tabIndex={tabIndex!}
          className={inputClass || ''}
          onChange={handleTextInputChange}
        />
        <div className='relative flex gap-1 mr-6'>
          <EmojiPickerWrapper
            theme={theme!}
            keepOpened={keepOpened!}
            disableRecent={disableRecent!}
            addSanitizeFn={addSanitizeFn}
            addPolluteFn={addPolluteFn}
            appendContent={appendContent}
          />
          {buttonGroup}
        </div>
      </div>
    </div>
  );
}

export default forwardRef(InputEmoji);
