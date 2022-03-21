import { MikroOrmModuleOptions as Options } from '@mikro-orm/nestjs';
import { LoadStrategy } from '@mikro-orm/core';
import { User } from './user/user.entity';
import { Member } from './member/member.entity';
import { Conversation } from './conversation/conversation.entity';
import { Message, Image } from './message/message.entity';
import { FriendRequest, UserFriend } from './friend/friend.entity';
import { Post, Reaction } from './post/post.entity';

const config: Options = {
  type: 'postgresql',
  clientUrl: process.env.POSTGRES_URL,
  entities: [
    User,
    Member,
    Message,
    Conversation,
    Image,
    FriendRequest,
    UserFriend,
    Post,
    Reaction,
  ],
  debug: true,
  loadStrategy: LoadStrategy.JOINED,
  registerRequestContext: false,
  migrations: {
    path: 'dist/common/migrations',
    pathTs: 'src/common/migrations',
  },
  driverOptions:
    process.env.NODE_ENV === 'production'
      ? {
          connection: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        }
      : undefined,
};

export default config;
