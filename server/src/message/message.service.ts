import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './message.dto';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversation/conversation.repository';
import { MemberService } from 'src/member/member.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly memberService: MemberService,
    private readonly conversationRepository: ConversationRepository,
    private readonly socketService: SocketService,
  ) {}

  async create(
    senderId: number,
    conversationId: number,
    createMessageDto: CreateMessageDto,
  ) {
    await this.memberService.isMemberOrThrow(senderId, conversationId);
    const message = this.messageRepository.create({
      creator: senderId,
      conversation: conversationId,
      text: createMessageDto.text,
    });
    await this.messageRepository.persistAndFlush(message);
    await this.conversationRepository.nativeUpdate(conversationId, {
      lastMessage: message,
    });
    await this.socketService.newMessage(senderId, conversationId, message);
    return message;
  }

  async paginated(
    meId: number,
    conversationId: number,
    { nextCursor, limit }: { limit?: number; nextCursor?: string },
  ) {
    limit = Math.min(limit || 3, 20);
    const limitPlusOne = limit + 1;
    await this.memberService.isMemberOrThrow(meId, conversationId);
    const opts = nextCursor
      ? {
          createdAt: { $lte: nextCursor },
        }
      : {};
    const messages = await this.messageRepository.find(
      { conversation: conversationId, ...opts },
      { orderBy: { createdAt: 'DESC' }, limit: limitPlusOne },
    );
    let _nextCursor: string | undefined = undefined;
    if (messages.length === limitPlusOne)
      _nextCursor = messages[messages.length - 1]?.createdAt.toISOString();

    return {
      data: messages.slice(0, limit),
      nextCursor: _nextCursor,
    };
  }
}
