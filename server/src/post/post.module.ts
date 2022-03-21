import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { PostController } from './post.controller';
import { Post, Reaction } from './post.entity';
import { PostService } from './post.service';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User, Post, Reaction] })],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
