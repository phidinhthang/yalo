import { Server } from 'socket.io';
import { UserRepository } from '../user/user.repository';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common/decorators';
import { User } from 'src/user/user.entity';

@Injectable()
export class SocketService {
  public socket: Server = null;

  constructor(private readonly em: EntityManager) {}

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
}
