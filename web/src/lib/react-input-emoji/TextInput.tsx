import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { handlePasteHtmlAtCaret } from './utils/inputEvent';

type Props = {
  onKeyDown: (event: React.KeyboardEvent) => void;
  onKeyUp: (event: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onChnage: (santiziedText: string) => void;
  onArrowUp: (event: React.KeyboardEvent) => void;
  onArrowDown: (event: React.KeyboardEvent) => void;
  onEnter: (event: React.KeyboardEvent) => void;
  onCopy: (event: React.ClipboardEvent) => void;
  onPaste: (event: React.ClipboardEvent) => void;
  placeholder: string;
  style: React.CSSProperties;
  tabIndex: number;
  className: string;
  onChange: (html: string) => void;
};
export type Ref = {
  appendContent: (html: string) => void;
  html: string;
  text: string;
  size: { width: number; height: number };
  focus: () => void;
};
const TextInput: React.ForwardRefRenderFunction<Ref, Props> = (
  { placeholder, style, tabIndex, className, onChange, ...props },
  ref
) => {
  useImperativeHandle(ref, () => ({
    appendContent: (html) => {
      textInputRef.current?.focus();

      handlePasteHtmlAtCaret(html);

      textInputRef.current?.focus();

      onChange(textInputRef.current!.innerHTML);
    },
    set html(value) {
      textInputRef.current!.innerHTML = value;

      onChange(textInputRef.current!.innerHTML);
    },
    get html() {
      return textInputRef.current!.innerHTML;
    },
    get text() {
      return textInputRef.current!.innerText;
    },
    get size() {
      return {
        width: textInputRef.current!.offsetWidth,
        height: textInputRef.current!.offsetHeight,
      };
    },
    focus() {
      textInputRef.current?.focus();
    },
  }));

  const textInputRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      props.onEnter(event);
    } else if (event.key === 'ArrowUp') {
      props.onArrowUp(event);
    } else if (event.key === 'ArrowDown') {
      props.onArrowDown(event);
    } else {
      if (event.key.length === 1) {
      }
    }

    props.onKeyDown(event);
  }

  function handleKeyUp(event: React.KeyboardEvent) {
    props.onKeyUp(event);

    onChange(textInputRef.current!.innerHTML);
  }

  return (
    <div className='react-input-emoji--container flex-auto' style={style}>
      <div
        ref={textInputRef}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabIndex={tabIndex}
        contentEditable
        className={`react-input-emoji--input font-[400] outline-none overflow-x-hidden overflow-y-auto relative whitespace-pre-wrap z-[1] w-full select-text text-left break-all ${
          className ? ` ${className}` : ''
        }`}
        placeholder={placeholder}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onCopy={props.onCopy}
        onPaste={props.onPaste}
        data-testid='react-input-emoji--input'
      />
    </div>
  );
};

const TextInputWithRef = forwardRef(TextInput);

export default TextInputWithRef;
