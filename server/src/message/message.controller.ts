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
import { CreateMessageDto, ReplyMessageDto } from './message.dto';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/decorators/meId.decorator';
import { Delete } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FilesToBodyInterceptor } from 'src/common/file.interceptor';
import { ApiConsumes } from '@nestjs/swagger';
import { ParseEnumPipe } from '@nestjs/common';
import { ReactionValue } from 'src/common/entities/reaction.entity';
import { BadRequestException } from '@nestjs/common';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(HttpAuthGuard)
  @Post('create/:conversationId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('filesOrImages'), FilesToBodyInterceptor)
  async create(
    @MeId() userId: number,
    @Param('conversationId', new ParseIntPipe()) conversationId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(userId, conversationId, createMessageDto);
  }

  @UseGuards(HttpAuthGuard)
  @Post('/:messageId/reply')
  async replyMessage(
    @MeId() userId: number,
    @Param('messageId', new ParseIntPipe()) messageId: number,
    @Body() replyMessageDto: ReplyMessageDto,
  ) {
    return this.messageService.replyMessage(userId, messageId, replyMessageDto);
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

  @UseGuards(HttpAuthGuard)
  @Post('/:messageId/reaction')
  reactsToMessage(
    @MeId() meId: number,
    @Param('messageId', new ParseIntPipe()) messageId: number,
    @Query('value', new ParseEnumPipe(ReactionValue)) value: ReactionValue,
    @Query('action') action: 'remove' | 'create',
  ) {
    if (action !== 'remove' && action !== 'create') {
      throw new BadRequestException();
    }

    return this.messageService.reactsToMessage(meId, messageId, value, action);
  }
}
