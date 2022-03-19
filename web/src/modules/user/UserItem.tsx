import { User } from '../../lib/api/entities';
import { useTypeSafeTranslation } from '../../shared-hooks/useTypeSafeTranslation';
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
  const { t } = useTypeSafeTranslation();
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
            ? t('common.ago', { time: new Date(user.lastLoginAt) })
            : null}
        </div>
      </div>
    </div>
  );
};
