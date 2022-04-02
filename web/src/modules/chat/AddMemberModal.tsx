import React from 'react';
import { useGetCurrentConversation } from '../../lib/useGetCurrentConverrsation';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface AddMemberModalProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddMemberModal = ({ isOpen, setOpen }: AddMemberModalProps) => {
  const { data: users } = useTypeSafeQuery('findAll');
  const { mutate: addMember } = useTypeSafeMutation('addMember');
  const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([]);
  const conversation = useGetCurrentConversation();
  const { data: me } = useTypeSafeQuery('me');

  return (
    <Modal
      title='Add member'
      isOpen={isOpen}
      onRequestClose={() => {
        setOpen(false);
        setSelectedUserIds([]);
      }}
      footer={
        <div className='flex flex-row-reverse w-full gap-3'>
          <Button
            onClick={() => {
              addMember([conversation!.id, selectedUserIds], {
                onSettled: () => {
                  setOpen(false);
                  setSelectedUserIds([]);
                },
              });
            }}
            disabled={selectedUserIds.length === 0}
          >
            Confirm
          </Button>
          <Button
            variant='secondary'
            onClick={() => {
              setOpen(false);
              setSelectedUserIds([]);
            }}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className='max-h-96 overflow-y-auto'>
        {users
          ?.filter((u) => u.id !== me?.id)
          .map((u) => {
            const isMember = conversation!.members.some(
              (m) => m.user.id === u.id
            );
            return (
              <label
                key={u.id}
                htmlFor={`add__member__${u.id}`}
                className='flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer'
              >
                <input
                  id={`add__member__${u.id}`}
                  type='checkbox'
                  checked={
                    selectedUserIds.some((uId) => uId === u.id) || isMember
                  }
                  onChange={(e) => {
                    if (isMember) return;
                    if (e.target.checked) {
                      setSelectedUserIds((uIds) => [...uIds, u.id]);
                    } else {
                      setSelectedUserIds((uIds) =>
                        uIds.filter((id) => id !== u.id)
                      );
                    }
                  }}
                  className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                ></input>
                <Avatar size='sm' src={u.avatarUrl} username={u.username} />
                <div>
                  <div>{u.username}</div>
                  {isMember ? (
                    <p className='text-gray-500 text-sm'>Đã tham gia</p>
                  ) : null}
                </div>
              </label>
            );
          })}
      </div>
    </Modal>
  );
};
