import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './message.dto';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversation/conversation.repository';
import { SocketService } from 'src/socket/socket.service';
import { BadRequestException } from '@nestjs/common';
import { MemberRepository } from 'src/member/member.repository';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Image, Message } from './message.entity';
import {
  ReactionRepository,
  ReactionValue,
} from 'src/common/entities/reaction.entity';
import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly memberRepository: MemberRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly socketService: SocketService,
    private readonly em: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    senderId: number,
    conversationId: number,
    createMessageDto: CreateMessageDto,
  ) {
    console.log('create message dto ', createMessageDto);

    if (
      (createMessageDto.text && createMessageDto.text.length === 0) ||
      (!createMessageDto.text && !createMessageDto.images?.length)
    ) {
      return false;
    }

    const uploadPromises = createMessageDto.images?.map(async (imageFile) => {
      const uploadResponse = await this.cloudinaryService.uploadImage(
        imageFile,
      );
      return uploadResponse;
    });

    const uploadResponses = await Promise.all(uploadPromises ?? []);

    const images: Image[] = uploadResponses?.map((r) => ({ url: r.url }));

    console.log('images ', images);

    await this.memberRepository.isMemberOrThrow(senderId, conversationId);
    const message = this.messageRepository.create({
      creator: senderId,
      conversation: conversationId,
      text: createMessageDto.text,
      images: images,
      numReactions: {},
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
    message.images = null;
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
    // const opts = nextCursor
    //   ? {
    //       createdAt: { $lte: nextCursor },
    //     }
    //   : {};
    // const messages = await this.messageRepository.find(
    //   { conversation: conversationId, ...opts },
    //   { orderBy: { createdAt: 'DESC' }, limit: limitPlusOne },
    // );
    const replacement: Array<string | number> =
      typeof nextCursor === 'string'
        ? [meId, conversationId, nextCursor, limitPlusOne]
        : [meId, conversationId, limitPlusOne];
    const messages: Message[] = await this.em.getConnection('read').execute(
      `
      select m.id,
      m.creator_id as "creator",
      m.conversation_id as "conversation",
      m.text, m.num_reactions as "numReactions",
      case when r.id is not null then r.value else null end as "reaction",
      m.created_at as "createdAt"
      from messages m
      left join reactions r on r.user_id = ? and r.message_id = m.id and r.type = 'm'
      where m.conversation_id = ? and ${
        typeof nextCursor === 'string' ? `m.created_at <= ?` : `1 + 1 =2`
      }
      order by m.created_at desc
      limit ? ;
      `,
      replacement,
    );
    let _nextCursor: string | undefined = undefined;
    if (messages.length === limitPlusOne)
      _nextCursor = messages[messages.length - 1]?.createdAt.toISOString();

    return {
      data: messages.slice(0, limit),
      nextCursor: _nextCursor,
    };
  }

  async reactsToMessage(
    meId: number,
    messageId: number,
    value: ReactionValue,
    action: 'create' | 'remove',
  ) {
    const message = await this.messageRepository.findOne(messageId);
    if (!message) throw new NotFoundException();

    await this.memberRepository.isMemberOrThrow(meId, message.conversation.id);

    let reaction = await this.reactionRepository.findOne({
      user: meId,
      message: messageId,
    });
    if (reaction && action === 'remove') {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `
				delete from reactions where user_id = ? and message_id = ?`,
          [meId, messageId],
        );
        await em.getConnection('write').execute(
          `update messages set num_reactions = 
            num_reactions || concat(?, coalesce(num_reactions->>?, '1')::int - 1, '}')::jsonb where messages.id = ?;
            `,
          [`{"${value}":`, `${value}`, messageId],
        );
      });
    } else if (!reaction && action === 'create') {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `insert into reactions (user_id, message_id, value, type) values (?, ?, ?, ?);
					`,
          [meId, messageId, value, 'm'],
        );
        await em.getConnection('write').execute(
          `update messages set num_reactions = 
            num_reactions || concat(?, coalesce(num_reactions->>?, '0')::int + 1, '}')::jsonb where messages.id = ?;
            `,
          [`{"${value}":`, `${value}`, messageId],
        );
      });
    } else if (reaction && action === 'create' && reaction.value !== value) {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `update reactions set value = ? 
          where user_id = ? and message_id = ? and type = ? 
					`,
          [value, meId, messageId, 'm'],
        );
        await em.getConnection('write').execute(
          `update messages set num_reactions = 
            num_reactions || concat(?, coalesce(num_reactions->>?, '0')::int + 1, '}')::jsonb 
            || concat(?, coalesce(num_reactions->>?, '1')::int - 1, '}')::jsonb
            where messages.id = ?;
            `,
          [
            `{"${value}":`,
            `${value}`,
            `{"${reaction.value}":`,
            `${reaction.value}`,
            messageId,
          ],
        );
      });
    }

    return true;
  }
}
