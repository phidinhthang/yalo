import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { Member } from './entities/member.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
  imports: [MikroOrmModule.forFeature({ entities: [Member, Conversation] })],
})
export class ConversationModule {}
