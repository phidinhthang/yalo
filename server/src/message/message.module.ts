import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Message } from './message.entity';
import { MemberModule } from 'src/member/member.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [MikroOrmModule.forFeature({ entities: [Message] }), MemberModule],
})
export class MessageModule {}
