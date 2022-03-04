import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.entity';
import { Member } from '../member/member.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/user/user.entity';
import { MemberModule } from 'src/member/member.module';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
  imports: [
    MikroOrmModule.forFeature({ entities: [Member, Conversation, User] }),
    MemberModule,
  ],
})
export class ConversationModule {}
