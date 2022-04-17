import React from 'react';
import { toast } from 'react-toastify';
import { useGetCurrentConversation } from '../../lib/useGetCurrentConverrsation';
import { useTypeSafeMutation } from '../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeUpdateQuery } from '../../shared-hooks/useTypeSafeUpdateQuery';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Modal } from '../../ui/Modal';

interface ChangeConversationTitleModalProps {
  isOpen: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void;
}

export const ChangeConversationTitleModal = ({
  isOpen,
  setOpen,
}: ChangeConversationTitleModalProps) => {
  const conversation = useGetCurrentConversation();
  const [newTitle, setNewTitle] = React.useState('');
  const { mutate: changeTitle, isLoading: isChangeTitleLoading } =
    useTypeSafeMutation('changeConversationTitle');
  const updateQuery = useTypeSafeUpdateQuery();

  React.useEffect(() => {
    setNewTitle(conversation?.title || '');
  }, [conversation]);

  return (
    <Modal
      isOpen={isOpen}
      title={'Set group name'}
      onRequestClose={() => {
        setOpen(false);
        setNewTitle(conversation?.title || '');
      }}
      footer={
        <div className='flex flex-row-reverse w-full gap-3'>
          <Button
            onClick={() => {
              changeTitle([conversation!.id, { title: newTitle }], {
                onSuccess: (data) => {
                  if (data) {
                  }
                  toast('Change conversation title successfully!', {
                    type: 'success',
                  });
                  updateQuery('getPaginatedConversations', (conversations) => {
                    const c: typeof conversations[number] = conversations.find(
                      (c) => c.id === conversation!.id
                    )!;
                    c!.title = newTitle;
                    return conversations;
                  });
                  updateQuery(['getConversation', conversation!.id], (c) => {
                    c.title = newTitle;
                    return c;
                  });
                  setOpen(false);
                },
                onError: (error) => {
                  toast(error.errors.title, { type: 'error' });
                },
              });
            }}
            disabled={newTitle.length === 0}
            loading={isChangeTitleLoading}
          >
            Confirm
          </Button>
          <Button
            variant='secondary'
            onClick={() => {
              setOpen(false);
              setNewTitle(conversation?.title || '');
            }}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <p>
        Are you sure you want to rename this group, a new group name will be
        visible with all members
      </p>
      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
    </Modal>
  );
};
