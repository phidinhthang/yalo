import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/user/user.entity';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User] })],
  providers: [SocketService, AppGateway],
  exports: [SocketService],
})
export class SocketModule {}
