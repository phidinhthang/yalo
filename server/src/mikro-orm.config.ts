import { MikroOrmModuleOptions as Options } from '@mikro-orm/nestjs';
import { LoadStrategy } from '@mikro-orm/core';
import { User } from './user/user.entity';
import { Member } from './member/member.entity';
import { Conversation } from './conversation/conversation.entity';
import { Message } from './message/message.entity';

const config: Options = {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  dbName: 'zaloweb',
  entities: [User, Member, Message, Conversation],
  debug: true,
  loadStrategy: LoadStrategy.JOINED,
  registerRequestContext: false,
  migrations: {
    path: 'dist/common/migrations',
    pathTs: 'src/common/migrations',
  },
};

export default config;
