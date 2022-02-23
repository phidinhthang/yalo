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
      <Avatar size='md' isOnline={user.isOnline} src={user.avatarUrl || ''} />
      <div className='ml-3'>
        <div>{user.username}</div>
        <div>{user.isOnline ? 'online' : 'offline'}</div>
      </div>
    </div>
  );
};
