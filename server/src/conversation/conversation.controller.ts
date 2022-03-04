import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Post,
  Body,
  UsePipes,
  Delete,
} from '@nestjs/common';
import { MeId } from 'src/common/decorators/meId.decorator';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { ValidationPipe } from 'src/common/validation.pipe';
import { CreateGroupConversationDto } from './conversation.dto';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(HttpAuthGuard)
  @Get('private/:partnerId')
  async findOrCreatePrivate(
    @MeId() meId: number,
    @Param('partnerId', new ParseIntPipe()) partnerId: number,
  ) {
    return this.conversationService.findOrCreatePrivate(meId, partnerId);
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(HttpAuthGuard)
  @Post('/')
  async createGroupConversation(
    @MeId() meId: number,
    @Body() createGroupConversationDto: CreateGroupConversationDto,
  ) {
    return this.conversationService.createGroupConversation(
      meId,
      createGroupConversationDto,
    );
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/:conversationId')
  async deleteGroupConversation(
    @MeId() meId: number,
    @Param('conversationId', new ParseIntPipe()) conversationId: number,
  ) {
    return this.conversationService.deleteGroupConversation(
      meId,
      conversationId,
    );
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/member/:conversationId')
  async leaveGroupConversation(
    @MeId() meId: number,
    @Param('conversationId', new ParseIntPipe()) conversationId: number,
  ) {
    return this.conversationService.leaveGroupConversation(
      meId,
      conversationId,
    );
  }

  @UseGuards(HttpAuthGuard)
  @Get('/')
  async paginated(@MeId() meId: number) {
    return this.conversationService.paginated(meId);
  }
}
