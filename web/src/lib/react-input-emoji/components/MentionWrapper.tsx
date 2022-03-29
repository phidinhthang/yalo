import React, { useEffect, useRef, useState } from 'react';

import { useMention } from '../hooks/useMention';
import MentionUserList, { Ref } from './MentionUserList';
import {
  MentionUser,
  TextInputListeners,
  SanitizeFn,
  Listener,
} from '../types/types';

type Props = {
  searchMention: (text: string) => Promise<MentionUser[]>;
  addEventListener: (
    event: keyof TextInputListeners,
    fn: Listener<any>
  ) => () => void;
  appendContent: (html: string) => void;
  addSanitizeFn: (fn: SanitizeFn) => void;
};
const MentionWrapper: React.FC<Props> = ({
  searchMention,
  addEventListener,
  appendContent,
  addSanitizeFn,
}) => {
  const metionUserListRef = useRef<Ref>(null);
  const [showUserList, setShowUserList] = useState(false);

  const {
    mentionSearchText,
    mentionUsers,
    loading,
    onKeyUp,
    onFocus,
    onSelectUser,
  } = useMention(searchMention);

  useEffect(() => {
    addSanitizeFn((html) => {
      const container = document.createElement('div');
      container.innerHTML = html;

      const mentionsEl = Array.prototype.slice.call(
        container.querySelectorAll('.react-input-emoji--mention--text')
      );

      mentionsEl.forEach((mentionEl) => {
        container.innerHTML = container.innerHTML.replace(
          mentionEl.outerHTML,
          `@[${mentionEl.dataset.mentionName}](userId:${mentionEl.dataset.mentionId})`
        );
      });

      return container.innerHTML;
    });
  }, [addSanitizeFn]);

  useEffect(() => {
    setShowUserList(mentionUsers.length > 0);
  }, [mentionUsers]);

  useEffect(() => {
    function checkClickOutside() {
      setShowUserList(false);
    }

    document.addEventListener('click', checkClickOutside);

    return () => {
      document.removeEventListener('click', checkClickOutside);
    };
  }, []);

  useEffect(() => {
    return addEventListener('keyUp', onKeyUp);
  }, [addEventListener, onKeyUp]);

  useEffect(() => {
    function handleKeyDown(event: React.KeyboardEvent) {
      switch (event.key) {
        case 'Esc': // IE/Edge specific value
        case 'Escape':
          setShowUserList(false);
          break;
        default:
          break;
      }
    }

    return addEventListener('keyDown', handleKeyDown);
  }, [addEventListener]);

  useEffect(() => {
    return addEventListener('focus', onFocus);
  }, [addEventListener, onFocus]);

  useEffect(() => {
    if (showUserList) {
      const unsubscribeArrowUp = addEventListener('arrowUp', (event) => {
        event.stopPropagation();
        event.preventDefault();
        metionUserListRef.current?.prevUser();
      });

      const unsubscribeArrowDown = addEventListener('arrowDown', (event) => {
        event.stopPropagation();
        event.preventDefault();
        metionUserListRef.current?.nextUser();
      });

      return () => {
        unsubscribeArrowUp();
        unsubscribeArrowDown();
      };
    }
  }, [addEventListener, showUserList]);

  function handleSelect(user: MentionUser) {
    onSelectUser();
    appendContent(
      `<span class="react-input-emoji--mention--text" data-mention-id="${user.id}" data-mention-name="${user.name}">@${user.name}</span> `
    );
  }

  return (
    <>
      {loading ? (
        <div className='absolute top-0 left-0 w-full z-10'>
          <div className='flex items-center justify-center absolute bottom-0 left-0 w-full px-0 py-[10px] rounded-[4px] border-gray-200 bg-gray-100'>
            <div className='react-input-emoji--mention--loading--spinner'>
              Loading...
            </div>
          </div>
        </div>
      ) : (
        showUserList && (
          <div
            className='absolute top-0 left-0 w-full z-10'
            onClick={(evt) => evt.stopPropagation()}
          >
            <MentionUserList
              ref={metionUserListRef}
              mentionSearchText={mentionSearchText}
              users={mentionUsers}
              onSelect={handleSelect}
              addEventListener={addEventListener}
            />
          </div>
        )
      )}
    </>
  );
};

export default MentionWrapper;
