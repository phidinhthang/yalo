import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Reaction } from 'src/common/entities/reaction.entity';
import { UserFriend } from 'src/friend/friend.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationService } from 'src/notification/notification.service';
import { SocketModule } from 'src/socket/socket.module';
import { User } from 'src/user/user.entity';
import { PostController } from './post.controller';
import { Post, Comment } from './post.entity';
import { PostService } from './post.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [User, Post, Reaction, Comment, UserFriend],
    }),
    NotificationModule,
    SocketModule,
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
