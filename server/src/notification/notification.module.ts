import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SocketModule } from 'src/socket/socket.module';
import { NotificationController } from './notification.controller';
import {
  Notification,
  NotificationChange,
  NotificationObject,
} from './notification.entity';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [
    MikroOrmModule.forFeature({
      entities: [Notification, NotificationChange, NotificationObject],
    }),
    SocketModule,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
