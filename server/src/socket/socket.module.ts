import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { UsersRepo } from '../users/users.repo';

@Global()
@Module({
  imports: [],
  providers: [UsersRepo, SocketService, AppGateway],
  exports: [SocketService],
})
export class SocketModule {}
