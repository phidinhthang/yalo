import {
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Controller,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './message.dto';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/decorators/meId.decorator';

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
  @Get('/:conversationId')
  async paginated(
    @MeId() userId: number,
    @Param('conversationId', new ParseIntPipe()) conversationId: number,
  ) {
    return this.messageService.paginated(userId, conversationId);
  }
}
