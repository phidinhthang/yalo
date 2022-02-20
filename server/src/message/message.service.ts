import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './message.dto';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async create(
    senderId: number,
    conversationId: number,
    createMessageDto: CreateMessageDto,
  ) {
    const message = this.messageRepository.create({
      creator: senderId,
      conversation: conversationId,
      text: createMessageDto.text,
    });
    await this.messageRepository.persistAndFlush(message);
    return message;
  }

  async paginated(meId: number, conversationId: number) {
    return this.messageRepository.find({
      conversation: { id: conversationId, members: { user: { $in: [meId] } } },
    });
  }
}
