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

  async paginatedRequests(meId: number): Promise<RequestResponse[]> {
    const res = await this.em.getConnection('read').execute(
      `
			select u.id, u.username, u.avatar_url as "avatarUrl", 1 as "type" from users u
			inner join friend_requests fr on u.id = fr."requester_id"
			where fr."recipient_id" = $1
			UNION
			select u.id, u.username, u.avatar_url as "avatarUrl", 0 as "type" from users u
			inner join friend_requests fr on u.id = fr."recipient_id"
			where fr."requester_id" = $1
			order by username
		`,
      [meId],
    );

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
