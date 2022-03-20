import React from 'react';
import Downshift from 'downshift';
import { useDebounce } from '../../../shared-hooks/useDebounce';
import { useTypeSafeQuery } from '../../../shared-hooks/useTypeSafeQuery';
import { SearchBar } from '../../../ui/Search/SearchBar';
import { SearchOverlay } from '../../../ui/Search/SearchOverlay';
import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';
import { User } from '../../../lib/api/entities';
import { useTypeSafeMutation } from '../../../shared-hooks/useTypeSafeMutation';
import { useIsDesktopScreen } from '../../../shared-hooks/useIsDesktopScreen';
import { IconButton } from '../../../ui/IconButton';
import { SvgSolidArrowLeft } from '../../../icons/SolidArrowLeft';
import { useMainPanelOpenStore } from '../useMainPanelOpenStore';
import { useUpdateRelationship } from '../../../lib/useUpdateRelationship';

export const SearchPanel = () => {
  const [rawText, setText] = React.useState('');
  const text = useDebounce(rawText, 200);
  const { data, isLoading: searchUserLoading } = useTypeSafeQuery(
    ['searchUser', text],
    { enabled: !!text.length },
    [text]
  );
  const { setOpen } = useMainPanelOpenStore();
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );
  const { data: selectedUser } = useTypeSafeQuery(
    ['getUserInfo', selectedUserId!],
    { enabled: !!selectedUserId },
    [selectedUserId!]
  );
  const isDesktopScreen = useIsDesktopScreen();
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
  const updateRelationship = useUpdateRelationship();

  return (
    <div className='flex gap-2 p-5'>
      {!isDesktopScreen ? (
        <IconButton
          className='mt-1'
          onClick={() => {
            setOpen(null);
          }}
        >
          <SvgSolidArrowLeft />
        </IconButton>
      ) : null}
      <div className='flex-auto'>
        <Downshift<Omit<User, 'password'>>
          onChange={(selection) => {
            if (!selection) return;
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
            getMenuProps,
            isOpen,

            highlightedIndex,
            getRootProps,
          }) => (
            <div className='relative w-full z-10 flex flex-col'>
              <SearchBar
                value={rawText}
                onChange={(e) => setText(e.target.value)}
                {...getInputProps()}
                isLoading={searchUserLoading}
              />
              {isOpen ? (
                <SearchOverlay
                  {...getRootProps(
                    { refKey: 'ref' },
                    { suppressRefError: true }
                  )}
                >
                  <ul
                    className='w-full px-2 mb-2 mt-12 bg-white dark:bg-dark-900 overflow-y-auto'
                    {...getMenuProps({ style: { top: 0 } })}
                  >
                    {!data?.length && searchUserLoading ? (
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
                          highlightedIndex === index
                            ? 'bg-gray-200 dark:bg-gray-600'
                            : ''
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
          )}
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
                          updateRelationship(selectedUser.id, {
                            isFriend: false,
                            meRequestFriend: true,
                            userRequestFriend: false,
                          }),
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
                        onSuccess: () => {
                          updateRelationship(selectedUser.id, {
                            isFriend: false,
                            userRequestFriend: false,
                            meRequestFriend: false,
                          });
                        },
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
                        onSuccess: () => {
                          updateRelationship(selectedUser.id, {
                            isFriend: false,
                            meRequestFriend: false,
                            userRequestFriend: false,
                          });
                        },
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
                            updateRelationship(selectedUser.id, {
                              isFriend: true,
                              userRequestFriend: false,
                              meRequestFriend: false,
                            });
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
                          onSuccess: () => {
                            updateRelationship(selectedUser.id, {
                              isFriend: false,
                              meRequestFriend: false,
                              userRequestFriend: false,
                            });
                          },
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
    </div>
  );
};
