import React from 'react';
import { SvgSolidImageAdd } from '../../../icons/SolidImageAdd';
import { useTypeSafeMutation } from '../../../shared-hooks/useTypeSafeMutation';
import { useTypeSafeQuery } from '../../../shared-hooks/useTypeSafeQuery';
import { useTypeSafeUpdateQuery } from '../../../shared-hooks/useTypeSafeUpdateQuery';
import { Button } from '../../../ui/Button';
import { Modal } from '../../../ui/Modal';

export const UserProfileTab = () => {
  const [isChangeAvatarModalOpen, setIsChangeAvatarModalOpen] =
    React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const updateQuery = useTypeSafeUpdateQuery();
  const { data: me } = useTypeSafeQuery('me');
  const { mutate: changeAvatar, isLoading } =
    useTypeSafeMutation('changeAvatar');
  const { mutate: removeAvatar } = useTypeSafeMutation('removeAvatar');
  const [file, setFile] = React.useState<File>();
  const [preview, setPreview] = React.useState<string>();

  React.useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('loadend', () => {
        setPreview(reader.result as string);
      });
    } else {
      setPreview(undefined);
    }
  }, [file]);

  return (
    <div>
      <h2 className='font-bold mb-4 text-xl'>User Profile</h2>
      <div className='h-[1px] bg-gray-300 w-full'></div>
      <div>
        <h5 className='mt-4 mb-1 font-semibold text-gray-700'>Avatar</h5>
        <div className='flex gap-2'>
          <Button
            onClick={() => {
              setIsChangeAvatarModalOpen(true);
            }}
          >
            Change Avatar
          </Button>
          {me?.avatarUrl ? (
            <Button
              variant='secondary'
              onClick={() => {
                removeAvatar([], {
                  onSuccess: () => {
                    updateQuery('me', (me) => {
                      me.avatarUrl = undefined;
                      return me;
                    });
                  },
                });
              }}
            >
              Remove Avatar
            </Button>
          ) : null}
        </div>
        <Modal
          title={file ? 'Preview Image' : 'Select Image'}
          isOpen={isChangeAvatarModalOpen}
          onRequestClose={() => {
            setIsChangeAvatarModalOpen(false);
            setFile(undefined);
          }}
          size='sm'
          footer={
            file ? (
              <div className='flex justify-between w-full'>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setFile(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  loading={isLoading}
                  onClick={() => {
                    changeAvatar([{ file }], {
                      onSuccess: ({ avatarUrl }) => {
                        updateQuery('me', (me) => {
                          me.avatarUrl = avatarUrl;
                          return me;
                        });
                      },
                      onSettled: () => {
                        setIsChangeAvatarModalOpen(false);
                        setFile(undefined);
                      },
                    });
                  }}
                >
                  Apply
                </Button>
              </div>
            ) : undefined
          }
        >
          {!file ? (
            <div className='flex items-center justify-center'>
              <div className='w-48 h-48 flex flex-col gap-3 items-center'>
                <div className='w-36 h-36 rounded-full bg-blue-500 text-white flex items-center justify-center'>
                  <SvgSolidImageAdd />
                </div>
                <Button
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                >
                  Upload Image
                </Button>
              </div>
              <input
                type='file'
                hidden
                ref={inputRef}
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className='flex justify-center'>
              <div className='w-64 h-64 overflow-hidden rounded-full border-4 border-black'>
                <img src={preview} className='w-full h-full object-cover' />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
