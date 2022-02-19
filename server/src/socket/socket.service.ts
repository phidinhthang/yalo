import { Server } from 'socket.io';
import { UserRepository } from '../user/user.repository';
import { Injectable } from '@nestjs/common/decorators';

@Injectable()
export class SocketService {
  public socket: Server = null;

  constructor(private readonly userRepository: UserRepository) {}

  async toggleOnlineStatus(userId: number) {
    await this.setOnlineStatus(userId, true);
    const users = await this.userRepository.findAll();
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('toggle_online', userId);
    });
  }

  async toggleOfflineStatus(userId: number) {
    await this.setOnlineStatus(userId, false);
    const users = await this.userRepository.findAll();
    users.forEach((u) => {
      this.socket.to(`${u.id}`).emit('toggle_offline', userId);
    });
  }

  async setOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    await this.userRepository.nativeUpdate(userId, { isOnline });
  }
}
