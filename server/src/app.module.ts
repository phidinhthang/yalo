import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmMiddleware, MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';
import { config } from './common/config';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    AuthModule,
    MemberModule,
    ConversationModule,
    MessageModule,
    UsersModule,
    SocketModule,
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    if (config.isProduction) await this.orm.getMigrator().up();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MikroOrmMiddleware).forRoutes('*');
  }
}
