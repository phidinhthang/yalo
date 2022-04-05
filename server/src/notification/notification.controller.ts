import { Patch } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { MeId } from 'src/common/decorators/meId.decorator';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(HttpAuthGuard)
  @Get('/')
  paginated(@MeId() meId: number) {
    return this.notificationService.paginated(meId);
  }

  @UseGuards(HttpAuthGuard)
  @Patch('/mark-as-read')
  markAsRead(@MeId() meId: number) {
    return this.notificationService.markAsRead(meId);
  }
}
