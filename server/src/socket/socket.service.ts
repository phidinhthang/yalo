import { Server } from 'socket.io';
import { UserRepository } from '../user/user.repository';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common/decorators';
import { User } from 'src/user/user.entity';
import { MessageRepository } from 'src/message/message.repository';
import { MemberRepository } from 'src/member/member.repository';

@Injectable()
export class SocketService {
  public socket: Server = null;

  constructor(
    private readonly em: EntityManager,
    private readonly memberRepository: MemberRepository,
  ) {}

  async toggleOnlineStatus(userId: number) {
    await this.setOnlineStatus(userId, true);
    const users = await this.em.fork().find(User, {});
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('toggle_online', userId);
    });
  }

  async toggleOfflineStatus(userId: number) {
    await this.setOnlineStatus(userId, false);
    const users = await this.em.fork().find(User, {});
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('toggle_offline', userId);
    });
  }

  async setOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    await this.em.fork().nativeUpdate(User, userId, { isOnline });
  }

  async newMessage(senderId: number, conversationId: number, message: any) {
    const members = await this.memberRepository.find({
      conversation: conversationId,
    });
    const users = members.map((m) => m.user).filter((u) => u.id !== senderId);
    console.log('member ids ', users);
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('new_message', message);
    });
  }
}
