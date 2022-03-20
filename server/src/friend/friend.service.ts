import { Injectable } from '@nestjs/common';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { UserFriend } from './friend.entity';
import { User } from 'src/user/user.entity';
import { RequestResponse } from './friend.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException } from '@nestjs/common';
import { FriendRequest } from './friend.entity';
import { SocketService } from 'src/socket/socket.service';
import { InjectRepository } from '@mikro-orm/nestjs';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(UserFriend)
    private readonly userFriendRepository: EntityRepository<UserFriend>,
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: EntityRepository<FriendRequest>,
    private readonly socketService: SocketService,
    private readonly em: EntityManager,
  ) {}

  async searchUser(meId: number, queriedUsernameStartsWith: string) {
    const res = await this.em.getConnection('read').execute(
      `select u.id, u.username, u.avatar_url as "avatarUrl"
      from users u
      where u.username ilike ?
      order by u.username`,
      [`${queriedUsernameStartsWith}%`],
    );
    return res;
  }

  async getUserInfo(meId: number, userId: number) {
    const res = await this.em.getConnection('read').execute(
      `select u.id, u.username, u.avatar_url as "avatarUrl",
      case when uf.friend_id is not null then true else false end as "isFriend",
      case when incoming_fr.requester_id is not null then true else false end as "userRequestFriend",
      case when outgoing_fr.requester_id is not null then true else false end as "meRequestFriend"
      from users u
      left join user_friends uf on uf.user_id = ? and uf.friend_id = u.id
      left join friend_requests incoming_fr on incoming_fr.requester_id = u.id and incoming_fr.recipient_id = ?
      left join friend_requests outgoing_fr on outgoing_fr.requester_id = ? and outgoing_fr.recipient_id = u.id
      where u.id = ?
      order by u.username`,
      [meId, meId, meId, userId],
    );
    if (!res?.[0]) return null;

    return res[0];
  }

  async paginatedFriends(meId: number): Promise<User[]> {
    const userFriends = await this.userFriendRepository.find(
      {
        user: meId,
      },
      { populate: ['friend'] },
    );

    const friends = userFriends.map((uf) => uf.friend);

    return friends;
  }

  async paginatedRequests(
    meId: number,
    type: 'incoming' | 'outgoing',
  ): Promise<RequestResponse[]> {
    let query: string;
    if (type === 'outgoing') {
      query = `select u.id, u.username, u.avatar_url as "avatarUrl", 'outgoing' as "type" from users u
			inner join friend_requests fr on u.id = fr."recipient_id"
			where fr."requester_id" = ?`;
    } else if (type === 'incoming') {
      query = `select u.id, u.username, u.avatar_url as "avatarUrl", 'incoming' as "type" from users u
			inner join friend_requests fr on u.id = fr."requester_id"
			where fr."recipient_id" = ?`;
    } else {
      return [];
    }

    const res = await this.em.getConnection('read').execute(query, [meId]);

    return res as any;
  }

  async createRequest(meId: number, targetId: number): Promise<FriendRequest> {
    if (meId === targetId) throw new BadRequestException();

    const friendExisted = await this.userFriendRepository.findOne({
      user: meId,
      friend: targetId,
    });

    if (friendExisted) {
      throw new BadRequestException();
    }

    const requestExisted = await this.friendRequestRepository.findOne({
      requester: meId,
      recipient: targetId,
    });

    if (requestExisted) {
      throw new BadRequestException();
    }

    const request = this.friendRequestRepository.create({
      requester: meId,
      recipient: targetId,
    });

    await this.friendRequestRepository.persistAndFlush(request);
    await this.socketService.newFriendRequest(meId, targetId);

    return request;
  }

  async acceptRequest(meId: number, targetId: number) {
    const request = await this.friendRequestRepository.findOne({
      requester: targetId,
      recipient: meId,
    });

    if (!request) {
      throw new BadRequestException();
    }

    await this.userFriendRepository.persistAndFlush([
      this.userFriendRepository.create({ user: meId, friend: targetId }),
      this.userFriendRepository.create({ user: targetId, friend: meId }),
    ]);
    await this.friendRequestRepository.removeAndFlush(request);
    await this.socketService.friendAccepted(targetId, meId);

    return true;
  }

  async cancelRequest(meId: number, targetId: number) {
    await this.friendRequestRepository.nativeDelete({
      requester: meId,
      recipient: targetId,
    });
    await this.friendRequestRepository.nativeDelete({
      requester: targetId,
      recipient: meId,
    });
    await this.socketService.requestCancelled(targetId, meId);
    return true;
  }

  async removeFriend(meId: number, targetId: number) {
    await this.userFriendRepository.nativeDelete({
      user: meId,
      friend: targetId,
    });
    await this.userFriendRepository.nativeDelete({
      user: targetId,
      friend: meId,
    });
    await this.socketService.friendRemoved(meId, targetId);

    return true;
  }
}
