import React, {
  useImperativeHandle,
  useState,
  forwardRef,
  useMemo,
  useEffect,
} from 'react';
import { Listener, MentionUser, TextInputListeners } from '../types/types';

type Props = {
  users: MentionUser[];
  mentionSearchText: string | null;
  onSelect: (user: MentionUser) => void;
  addEventListener: (
    event: keyof TextInputListeners,
    fn: Listener<any>
  ) => () => void;
};
export type Ref = {
  prevUser: () => void;
  nextUser: () => void;
};

const MentionUserList: React.ForwardRefRenderFunction<Ref, Props> = (
  { users, mentionSearchText, onSelect, addEventListener },
  ref
) => {
  const [selectedUser, setSelectedUser] = useState(0);

  useImperativeHandle(ref, () => ({
    prevUser: () => {
      setSelectedUser((currentSelectedUser) => {
        if (currentSelectedUser === 0) {
          return 0;
        }

        return currentSelectedUser - 1;
      });
    },
    nextUser: () => {
      setSelectedUser((currentSelectedUser) => {
        if (currentSelectedUser === users.length - 1) {
          return users.length - 1;
        }

        return currentSelectedUser + 1;
      });
    },
  }));

  useEffect(() => {
    setSelectedUser(0);
  }, [users]);

  function getMentionSelectedNameEl(selectedText: string, rest: string) {
    return `<span class="react-input-emoji--mention--item--name__selected" data-testid="metion-selected-word">${selectedText}</span>${rest}`;
  }

  const usersFiltered = useMemo<
    Array<MentionUser & { nameHtml: string }>
  >(() => {
    const searchText = mentionSearchText
      ? mentionSearchText.substring(1).toLocaleLowerCase()
      : '';
    return users.map((user) => {
      let nameHtml = user.name;

      if (mentionSearchText && mentionSearchText.length > 1) {
        if (user.name.toLowerCase().startsWith(searchText)) {
          nameHtml = getMentionSelectedNameEl(
            user.name.substring(0, searchText.length),
            user.name.substring(searchText.length)
          );
        } else {
          const names = user.name.split(' ');

          nameHtml = names
            .map((name) => {
              if (name.toLocaleLowerCase().startsWith(searchText)) {
                return getMentionSelectedNameEl(
                  name.substring(0, searchText.length),
                  name.substring(searchText.length)
                );
              }
              return name;
            })
            .join(' ');
        }
      }

      return {
        ...user,
        nameHtml,
      };
    });
  }, [mentionSearchText, users]);

  function handleClick(user: MentionUser) {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      onSelect(user);
    };
  }

  useEffect(() => {
    return addEventListener('enter', (event) => {
      event.stopPropagation();
      event.preventDefault();
      onSelect(usersFiltered[selectedUser]);
    });
  }, [addEventListener, onSelect, selectedUser, usersFiltered]);

  return (
    <ul
      className='bg-gray-100 border-gray-200 border rounded-[4px] m-0 p-0 list-none flex gap-[5px] flex-col absolute bottom-0 w-full left-0'
      data-testid='mention-user-list'
    >
      {usersFiltered.map((user, index) => (
        <li key={user.id}>
          <button
            type='button'
            onClick={handleClick(user)}
            className={`flex items-center gap-[10px] py-[5px] px-[10px] bg-transparent w-full m-0 border-none ${
              selectedUser === index ? ' bg-[#eeeeee]' : ''
            }`}
            onMouseOver={() => setSelectedUser(index)}
          >
            <img className='w-[34px] h-[34px] rounded-full' src={user.image} />
            <div
              className='font-[16px] text-[#333333]'
              dangerouslySetInnerHTML={{ __html: user.nameHtml }}
            />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default forwardRef(MentionUserList);
