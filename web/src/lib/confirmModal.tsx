import create from 'zustand';
import { combine } from 'zustand/middleware';
import { useTypeSafeTranslation } from '../shared-hooks/useTypeSafeTranslation';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const useConfirmModalStore = create(
  combine(
    { message: '', onConfirm: undefined as undefined | (() => void) },
    (set) => ({
      set,
      close: () => set({ onConfirm: undefined, message: '' }),
    })
  )
);

export const confirmModal = (message: string, onConfirm: () => void) => {
  useConfirmModalStore.getState().set({ message, onConfirm });
};

export const ConfirmModal = () => {
  const { onConfirm, message, close } = useConfirmModalStore();
  const { t } = useTypeSafeTranslation();

  return (
    <Modal
      isOpen={!!onConfirm}
      onRequestClose={() => close()}
      footer={
        <div className='flex w-full'>
          <div className='flex-grow'></div>
          <Button
            onClick={() => {
              close();
              onConfirm?.();
            }}
          >
            ok
          </Button>
        </div>
      }
    >
      {message}
    </Modal>
  );
};
