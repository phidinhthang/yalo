import { MikroOrmModuleOptions as Options } from '@mikro-orm/nestjs';
import { LoadStrategy } from '@mikro-orm/core';
import { User } from './user/user.entity';
import { Member } from './member/member.entity';
import {
  Conversation,
  MemberPreview,
} from './conversation/conversation.entity';
import { Message, Image } from './message/message.entity';
import { FriendRequest, UserFriend } from './friend/friend.entity';
import { Post, Comment } from './post/post.entity';
import { NumReactions, Reaction } from './common/entities/reaction.entity';
import {
  NotificationEntityType,
  NotificationObject,
  Notification,
  NotificationChange,
} from './notification/notification.entity';

const config: Options = {
  type: 'postgresql',
  clientUrl: process.env.POSTGRES_URL,
  entities: [
    User,
    Member,
    Message,
    MemberPreview,
    Conversation,
    Image,
    FriendRequest,
    UserFriend,
    Comment,
    NumReactions,
    Reaction,
    Post,
    NotificationEntityType,
    NotificationObject,
    Notification,
    NotificationChange,
  ],
  debug: true,
  loadStrategy: LoadStrategy.JOINED,
  registerRequestContext: false,
  migrations: {
    path: 'dist/common/migrations',
    pathTs: 'src/common/migrations',
    disableForeignKeys: false,
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
