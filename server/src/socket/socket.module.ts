import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AppGateway } from './app.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/user/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Member } from 'src/member/member.entity';
import { UserFriend } from 'src/friend/friend.entity';
import { Post } from 'src/post/post.entity';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [User, Member, UserFriend, Post] }),
    AuthModule,
  ],
  providers: [SocketService, AppGateway],
  exports: [SocketService],
})
export class SocketModule {}
