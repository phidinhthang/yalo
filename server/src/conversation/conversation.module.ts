import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.entity';
import { Member } from '../member/member.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
  imports: [MikroOrmModule.forFeature({ entities: [Member, Conversation] })],
})
export class ConversationModule {}
