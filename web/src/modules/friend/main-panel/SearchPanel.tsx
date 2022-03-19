import React from 'react';
import Downshift from 'downshift';
import { useDebounce } from '../../../shared-hooks/useDebounce';
import { useTypeSafeQuery } from '../../../shared-hooks/useTypeSafeQuery';
import { SearchBar } from '../../../ui/Search/SearchBar';
import { SearchOverlay } from '../../../ui/Search/SearchOverlay';
import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';
import { User } from '../../../lib/api/entities';
import { useTypeSafeUpdateQuery } from '../../../shared-hooks/useTypeSafeUpdateQuery';
import { useTypeSafeMutation } from '../../../shared-hooks/useTypeSafeMutation';

export const SearchPanel = () => {
  const [rawText, setText] = React.useState('');
  const text = useDebounce(rawText, 200);
  const { data, isLoading } = useTypeSafeQuery(
    ['searchUser', text],
    { enabled: !!text.length },
    [text]
  );
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );
  const { data: selectedUser } = useTypeSafeQuery(
    ['getUserInfo', selectedUserId!],
    { enabled: !!selectedUserId },
    [selectedUserId!]
  );
  const { data: me } = useTypeSafeQuery('me');
  const { mutate: createFriendRequest } = useTypeSafeMutation(
    'createFriendRequest'
  );
  const { mutate: cancelFriendRequest } = useTypeSafeMutation(
    'cancelFriendRequest'
  );
  const { mutate: acceptFriendRequest } = useTypeSafeMutation(
    'acceptFriendRequest'
  );
  const { mutate: removeFriend } = useTypeSafeMutation('removeFriend');
  const updateQuery = useTypeSafeUpdateQuery();

  const updateRelationship = (
    field: 'isFriend' | 'meRequestFriend' | 'userRequestFriend',
    value: boolean
  ) => {
    updateQuery(['getUserInfo', selectedUserId!], (user) => {
      if (user) {
        user[field] = value;
      }
      return user;
    });
  };

  return (
    <div className='p-6'>
      <Downshift<Omit<User, 'password'>>
        onChange={(selection) => {
          if (!selection) return;
          console.log('selection ', selection);
          setSelectedUserId(selection.id);
        }}
        onInputValueChange={(v) => setText(v)}
        itemToString={(item) => {
          if (!item) {
            return '';
          } else if ('username' in item) {
            return item.username;
          }
          return '';
        }}
      >
        {({
          getInputProps,
          getItemProps,
          getLabelProps,
          getMenuProps,
          isOpen,

          inputValue,
          highlightedIndex,
          selectedItem,
          getRootProps,
        }) => {
          console.log('is open ', isOpen);
          return (
            <div className='relative w-full z-10 flex flex-col'>
              <SearchBar
                value={rawText}
                onChange={(e) => setText(e.target.value)}
                {...getInputProps()}
                isLoading={isLoading}
              />
              {isOpen ? (
                <SearchOverlay
                  {...getRootProps(
                    { refKey: 'ref' },
                    { suppressRefError: true }
                  )}
                >
                  <ul
                    className='w-full px-2 mb-2 mt-12 bg-white overflow-y-auto'
                    {...getMenuProps({ style: { top: 0 } })}
                  >
                    {!data || !data.length ? (
                      <h5 className='font-bold text-lg text-center'>
                        No results
                      </h5>
                    ) : null}
                    {(data || []).map((user, index) => (
                      <div
                        {...getItemProps({
                          key: user.id,
                          index,
                          item: user,
                        })}
                        className={`flex p-2 hover:bg-gray-100 dark:hover:bg-dark-300 hover:cursor-pointer ${
                          highlightedIndex === index ? 'bg-gray-200' : ''
                        }`}
                      >
                        <Avatar
                          size='md'
                          src={user.avatarUrl}
                          username={user.username}
                        />
                        <div className='ml-3'>
                          <div>{user.username}</div>
                        </div>
                      </div>
                    ))}
                  </ul>
                </SearchOverlay>
              ) : null}
            </div>
          );
        }}
      </Downshift>
      {selectedUser ? (
        <div className='flex flex-col items-center mt-6'>
          <Avatar
            size='default'
            src={selectedUser.avatarUrl}
            username={selectedUser.username}
          />
          <h5 className='font-bold text-xl mt-1 text-center'>
            {selectedUser.username}{' '}
            {selectedUser.id === me?.id ? `(You)` : null}
          </h5>
          {selectedUser.id !== me?.id && (
            <div className='flex gap-3 justify-center mt-3'>
              {!selectedUser.meRequestFriend &&
              !selectedUser.isFriend &&
              !selectedUser.userRequestFriend ? (
                <Button
                  onClick={() => {
                    createFriendRequest([selectedUser.id], {
                      onSuccess: () =>
                        updateRelationship('meRequestFriend', true),
                    });
                  }}
                >
                  Send friend request
                </Button>
              ) : null}
              {selectedUser.isFriend ? (
                <Button
                  variant='secondary'
                  onClick={() => {
                    removeFriend([selectedUser.id], {
                      onSuccess: () => updateRelationship('isFriend', false),
                    });
                  }}
                >
                  Remove friend
                </Button>
              ) : null}
              {selectedUser.meRequestFriend ? (
                <Button
                  variant='secondary'
                  onClick={() => {
                    cancelFriendRequest([selectedUser.id], {
                      onSuccess: () =>
                        updateRelationship('meRequestFriend', false),
                    });
                  }}
                >
                  Cancel request
                </Button>
              ) : null}
              {selectedUser.userRequestFriend ? (
                <>
                  <Button
                    onClick={() => {
                      acceptFriendRequest([selectedUser.id], {
                        onSuccess: () => {
                          updateRelationship('isFriend', true);
                          updateRelationship('userRequestFriend', false);
                        },
                      });
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() =>
                      cancelFriendRequest([selectedUser.id], {
                        onSuccess: () =>
                          updateRelationship('userRequestFriend', false),
                      })
                    }
                  >
                    Cancel request
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
