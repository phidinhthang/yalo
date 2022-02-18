import { Server, Socket } from 'socket.io';
import { UsersRepo } from '../users/users.repo';
import { Injectable } from '@nestjs/common/decorators';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketService {
  public socket: Server = null;

  constructor(private readonly usersRepo: UsersRepo) {}

  async toggleOnlineStatus(userId: number) {
    await this.setOnlineStatus(userId, true);
    const users = await this.usersRepo.findAll();
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('toggle_online', userId);
    });
  }

  async toggleOfflineStatus(userId: number) {
    await this.setOnlineStatus(userId, false);
    const users = await this.usersRepo.findAll();
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('toggle_offline', userId);
    });
  }

  async setOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    await this.usersRepo.update(userId, { isOnline });
  }
}
