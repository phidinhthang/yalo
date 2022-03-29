import React, { memo, useMemo } from 'react';
import { Picker, CategoryName } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { EmojiMartItem } from '../types/types';

type Props = {
  theme: 'light' | 'dark' | 'auto';
  onSelectEmoji: (emojiItem: EmojiMartItem) => void;
  disableRecent: boolean;
  customEmojis: object[];
};
function EmojiPicker({
  theme,
  onSelectEmoji,
  disableRecent,
  customEmojis,
}: Props) {
  const excludePicker = useMemo(() => {
    const exclude: CategoryName[] = [];

    if (disableRecent) {
      exclude.push('recent');
    }

    return exclude;
  }, [disableRecent]);

  return (
    <Picker
      theme={theme}
      set='twitter'
      showPreview={false}
      showSkinTones={false}
      onSelect={onSelectEmoji}
      exclude={excludePicker}
      custom={customEmojis as any}
    />
  );
}

export default memo(EmojiPicker);
