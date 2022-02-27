import { formatDistanceToNow } from 'date-fns';
import { User } from '../../lib/entities';
import { Avatar } from '../../ui/Avatar';

interface UserItemProps {
  user: Omit<User, 'password'>;
  onClick: () => void;
  className?: string;
}

export const UserItem: React.FC<UserItemProps> = ({
  user,
  onClick,
  className = '',
}) => {
  return (
    <div onClick={onClick} className={`flex ${className}`}>
      <Avatar
        size='md'
        src={user.avatarUrl || ''}
        isOnline={user.isOnline}
        username={user.username}
      />
      <div className='ml-3'>
        <div>{user.username}</div>
        <div className='text-sm text-gray-500 italic'>
          {!user.isOnline && user.lastLoginAt
            ? formatDistanceToNow(new Date(user.lastLoginAt), {
                addSuffix: true,
              })
            : null}
        </div>
      </div>
    </div>
  );
};
