import { useTypeSafeQuery } from '../../../shared-hooks/useTypeSafeQuery';
import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';
import { useSelectedTabPanelStore } from '../useSelectedTabPanelStore';

export const MyAccountTab = () => {
  const { data: me } = useTypeSafeQuery('me');
  const setSelectedTab = useSelectedTabPanelStore((s) => s.setSelectedTab);
  return (
    <div>
      <h2 className='font-bold mb-4 text-xl'>My Account</h2>
      <div className='flex justify-between'>
        <div className='flex gap-4 items-center'>
          <Avatar username={me?.username} isOnline={true} src={me?.avatarUrl} />
          <div>
            <h4 className='font-semibold text-lg'>{me?.username}</h4>
          </div>
        </div>
        <div>
          <Button
            onClick={() => {
              setSelectedTab('user-profile');
            }}
          >
            Edit user profile
          </Button>
        </div>
      </div>
    </div>
  );
};
