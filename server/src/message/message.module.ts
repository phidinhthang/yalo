import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Message } from './message.entity';
import { Conversation } from '../conversation/conversation.entity';
import { SocketModule } from 'src/socket/socket.module';
import { Member } from 'src/member/member.entity';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [
    MikroOrmModule.forFeature({ entities: [Message, Conversation, Member] }),
    SocketModule,
  ],
})
export class MessageModule {}
