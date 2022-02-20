import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Message } from './message.entity';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [MikroOrmModule.forFeature({ entities: [Message] })],
})
export class MessageModule {}
