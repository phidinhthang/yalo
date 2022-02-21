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
    await this.conversationRepository.nativeUpdate(conversationId, {
      lastMessage: message,
    });
    await this.messageRepository.persistAndFlush(message);
    await this.socketService.newMessage(conversationId, message);
    return message;
  }

  async paginated(meId: number, conversationId: number) {
    await this.memberService.isMemberOrThrow(meId, conversationId);
    return this.messageRepository.find({ conversation: conversationId });
  }
}
