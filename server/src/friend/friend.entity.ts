import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKeyType,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { UserFriendRepository } from './friend.repository';

@Entity({ tableName: 'friend_requests' })
export class FriendRequest {
  @ManyToOne(() => User, { primary: true, onDelete: 'cascade' })
  requester: User;

  @ManyToOne(() => User, { primary: true, onDelete: 'cascade' })
  recipient: User;

  [PrimaryKeyType]: [number, number];
}

@Entity({
  tableName: 'user_friends',
  customRepository: () => UserFriendRepository,
})
export class UserFriend {
  [EntityRepositoryType]?: UserFriendRepository;

  @ManyToOne(() => User, { primary: true, onDelete: 'cascade' })
  user: User;

  @ManyToOne(() => User, { primary: true, onDelete: 'cascade' })
  friend: User;

  [PrimaryKeyType]: [number, number];
}
