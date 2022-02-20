import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MeId } from 'src/common/decorators/meId.decorator';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
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

  @UseGuards(HttpAuthGuard)
  @Get('/')
  async paginated(@MeId() meId: number) {
    return this.conversationService.paginated(meId);
  }
}
