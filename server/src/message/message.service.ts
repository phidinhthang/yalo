import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './message.dto';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversation/conversation.repository';
import { SocketService } from 'src/socket/socket.service';
import { BadRequestException } from '@nestjs/common';
import { MemberRepository } from 'src/member/member.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly memberRepository: MemberRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly socketService: SocketService,
  ) {}

  async create(
    senderId: number,
    conversationId: number,
    createMessageDto: CreateMessageDto,
  ) {
    if (createMessageDto.text && createMessageDto.text.length === 0) {
      return false;
    }
    await this.memberRepository.isMemberOrThrow(senderId, conversationId);
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

  async delete(senderId: number, messageId: number) {
    const message = await this.messageRepository.findOne({
      id: messageId,
      creator: senderId,
    });
    if (!message) {
      throw new BadRequestException();
    }
    message.text = '';
    message.isDeleted = true;
    await this.messageRepository.persistAndFlush(message);
    await this.socketService.deleteMessage(
      messageId,
      senderId,
      message.conversation.id,
    );

    return true;
  }

  async paginated(
    meId: number,
    conversationId: number,
    { nextCursor, limit }: { limit?: number; nextCursor?: string },
  ) {
    limit = Math.min(limit || 3, 20);
    const limitPlusOne = limit + 1;
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
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
