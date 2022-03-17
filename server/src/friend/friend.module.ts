import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { FriendRequest, UserFriend } from './friend.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [
    MikroOrmModule.forFeature({
      entities: [FriendRequest, UserFriend],
    }),
    SocketModule,
  ],
})
export class FriendModule {}
