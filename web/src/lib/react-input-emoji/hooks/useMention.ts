// @ts-check
import React, { useCallback, useState } from 'react';
import { MentionUser } from '../types/types';
import {
  deleteTextFromAtToCaret,
  getElementWithFocus,
  getTextFromAtToCaret,
} from '../utils/mention';

export function useMention(
  searchMention: (text: string) => Promise<MentionUser[]>
) {
  const [loading, setLoading] = useState(false);

  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionSearchText, setMentionSearchText] = useState<string | null>(
    null
  );

  const onSelectUser = useCallback(() => {
    deleteTextFromAtToCaret();
    setMentionUsers([]);
  }, []);

  const checkMentionText = useCallback(async () => {
    const mentionText = getTextFromAtToCaret();

    const inMentionNode =
      getElementWithFocus()?.element.parentElement?.hasAttribute(
        'data-mention-id'
      );
    setMentionSearchText(mentionText!);

    if (mentionText === null) {
      setMentionUsers([]);
    } else if (!inMentionNode) {
      setLoading(true);
      const users = await searchMention(mentionText);
      setLoading(false);
      setMentionUsers(users!);
    } else if (inMentionNode) {
      setMentionUsers([]);
    }
  }, [searchMention]);

  const onKeyUp = useCallback(
    async (event: React.KeyboardEvent) => {
      const isCharacterKeyPressed = event.key.length === 1;
      const mentionNode =
        getElementWithFocus()?.element.parentElement?.hasAttribute(
          'data-mention-id'
        )
          ? getElementWithFocus()?.element.parentElement
          : null;

      if (mentionNode && isCharacterKeyPressed) {
        const range = window.getSelection()?.getRangeAt(0);
        const startOffset = range?.startOffset;
        const text = document.createTextNode(mentionNode?.textContent!);
        mentionNode?.parentNode?.replaceChild(text, mentionNode);
        const newRange = new Range();
        if (startOffset) {
          newRange.setStart(text, startOffset);
          newRange.setEnd(text, startOffset);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(newRange);
        }
      }

      if (
        event.key === 'Backspace' &&
        getElementWithFocus()?.element?.parentElement?.hasAttribute(
          'data-mention-id'
        )
      ) {
        const elementWithFocus = getElementWithFocus();
        elementWithFocus?.element.parentElement?.remove();
      } else if (
        !['ArrowUp', 'ArrowDown', 'Esc', 'Escape'].includes(event.key)
      ) {
        checkMentionText();
      }
    },
    [checkMentionText, searchMention]
  );

  const onFocus = useCallback(() => {
    checkMentionText();
  }, [checkMentionText]);

  return {
    mentionSearchText,
    mentionUsers,
    onKeyUp,
    onFocus,
    onSelectUser,
    loading,
  };
}
