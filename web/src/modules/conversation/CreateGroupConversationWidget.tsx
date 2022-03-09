import React from 'react';
import { toast } from 'react-toastify';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Input } from '../../ui/Input';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { SvgOutlineUserGroup } from '../../icons/OutlineUserGroup';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';

export const CreateGroupConversationWidget = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { t } = useTypeSafeTranslation();
  const [title, setTitle] = React.useState('');
  const { data: users } = useTypeSafeQuery('findAll');
  const { data: me } = useTypeSafeQuery('me');
  const [memberIds, setMemberIds] = React.useState<number[]>([]);
  const { mutate: createGroupConversation } = useTypeSafeMutation(
    'createGroupConversation'
  );
  const clearModalState = () => {
    setMemberIds([]);
    setTitle('');
  };
  const updateQuery = useTypeSafeUpdateQuery();

  return (
    <>
      <button
        type='button'
        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
        onClick={() => setIsModalOpen(true)}
      >
        <SvgOutlineUserGroup className='h-4 w-4' />
      </button>
      <Modal
        title={t('conversation.create.label')}
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          clearModalState();
        }}
        footer={
          <div className='flex flex-row-reverse'>
            <Button
              variant='secondary'
              onClick={() => {
                console.log('member ids', memberIds);
                createGroupConversation([{ title, memberIds }], {
                  onSuccess: (data) => {
                    updateQuery(
                      'getPaginatedConversations',
                      (conversations) => {
                        if (!conversations) return conversations;
                        return [data, ...conversations];
                      }
                    );
                    toast.success(t('conversation.create.success'));
                    setIsModalOpen(false);
                    clearModalState();
                  },
                  onError: (error) => {
                    console.log('conversation err ', error);
                    toast.error(t('conversation.create.failure'));
                  },
                });
              }}
            >
              {t('conversation.create.label')}
            </Button>
          </div>
        }
      >
        <Input
          placeholder={t('conversation.create.placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className='max-h-96 overflow-y-auto'>
          {users
            ?.filter((u) => u.id !== me?.id)
            .map((u) => (
              <label
                key={u.id}
                htmlFor={`member__${u.id}`}
                className='flex items-center gap-3 p-2 hover:bg-gray-100 hover:cursor-pointer'
              >
                <input
                  id={`member__${u.id}`}
                  type='checkbox'
                  checked={memberIds.some((mId) => mId === u.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setMemberIds((mIds) => [...mIds, u.id]);
                    } else {
                      setMemberIds((mIds) => mIds.filter((id) => id !== u.id));
                    }
                  }}
                  className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                ></input>
                <Avatar size='sm' src={u.avatarUrl} username={u.username} />
                <div>
                  <div>{u.username}</div>
                </div>
              </label>
            ))}
        </div>
      </Modal>
    </>
  );
};
