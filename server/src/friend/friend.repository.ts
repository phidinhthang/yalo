import { EntityRepository } from '@mikro-orm/postgresql';
import { FriendRequest, UserFriend } from './friend.entity';
import { User } from '../user/user.entity';

export class UserFriendRepository extends EntityRepository<UserFriend> {
  public async getFriends(userId: number): Promise<User[]> {
    const userFriends = await this.find(
      {
        user: userId,
      },
      { populate: ['friend'] },
    );

    const friends = userFriends.map((uf) => uf.friend);

    return friends;
  }
}

export class FriendRequestRepository extends EntityRepository<FriendRequest> {}
