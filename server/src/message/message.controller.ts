import {
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Controller,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './message.dto';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/decorators/meId.decorator';
import { Delete } from '@nestjs/common';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(HttpAuthGuard)
  @Post('create/:conversationId')
  async create(
    @MeId() userId: number,
    @Param('conversationId', new ParseIntPipe()) conversationId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(userId, conversationId, createMessageDto);
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/:messageId')
  async delete(
    @MeId() userId: number,
    @Param('messageId', new ParseIntPipe()) messageId: number,
  ) {
    return this.messageService.delete(userId, messageId);
  }

  @UseGuards(HttpAuthGuard)
  @Get('/:conversationId')
  async paginated(
    @MeId() userId: number,
    @Param('conversationId', new ParseIntPipe()) conversationId: number,
    @Query() q: { limit?: number; nextCursor?: string },
  ) {
    q.limit = parseInt(q?.limit as unknown as string, 10);
    if (Number.isNaN(q.limit)) q.limit = 3;
    return this.messageService.paginated(userId, conversationId, q);
  }
}
