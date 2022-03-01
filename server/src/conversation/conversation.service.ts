import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { ConversationRepository } from './conversation.repository';
import { ConversationType } from './conversation.entity';
import { Member } from '../member/member.entity';
import { CreateGroupConversationDto } from './conversation.dto';
import { UserRepository } from 'src/user/user.repository';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    @InjectRepository(Member)
    private readonly memberRepository: EntityRepository<Member>,
    private readonly userRepository: UserRepository,
    private readonly orm: MikroORM,
    private readonly socketService: SocketService,
  ) {}

  async findOrCreatePrivate(meId: number, partnerId: number) {
    const conversationId = await this.orm.em.getConnection('read').execute(`
		select c.id from members m1 
			inner join conversations c on c.id = m1.conversation_id and c.type = 'private'
				inner join members m2 on m2.user_id = ${partnerId} and m2.conversation_id = c.id
					where m1.user_id = ${meId};
		`);
    console.log('conversation id ', conversationId, typeof conversationId);
    if (conversationId) {
      const conversation = await this.conversationRepository.findOne(
        conversationId,
        { populate: ['members', 'members.user', 'lastMessage'] },
      );

      if (conversation) return conversation;
    }
    const me = await this.orm.em.findOne(User, meId);
    const partner = await this.orm.em.findOne(User, partnerId);
    const meMember = this.memberRepository.create({
      user: me,
    });
    const partnerMember = this.memberRepository.create({
      user: partner,
    });

    const conversation = this.conversationRepository.create({
      type: ConversationType.PRIVATE,
      members: [meMember, partnerMember],
    });

    await this.orm.em.persistAndFlush([meMember, partnerMember, conversation]);
    return conversation;
  }

  async createGroupConversation(
    meId: number,
    { title, memberIds }: CreateGroupConversationDto,
  ) {
    const memberCount = await this.userRepository.count({
      id: { $in: memberIds },
    });
    console.log('member count ', memberCount);
    if (memberCount < memberIds.length) {
      throw new BadRequestException({
        errors: {
          memberIds: ['some member does not exist.'],
        },
      });
    }
    memberIds.push(meId);

    let conversation = this.conversationRepository.create({
      title,
      admin: meId,
      type: ConversationType.GROUP,
    });
    memberIds.forEach((mId) => {
      const member = this.memberRepository.create({ user: mId, conversation });
      conversation.members.add(member);
    });

    await this.conversationRepository.persistAndFlush(conversation);

    conversation = await this.conversationRepository.findOne(conversation.id, {
      populate: ['members', 'members.user', 'lastMessage'],
    });
    await this.socketService.newConversation(meId, conversation);

    return conversation;
  }

  async paginated(meId: number) {
    const members = await this.memberRepository.find({ user: meId });
    const conversationIds = members.map((m) => m.conversation.id);
    const conversations = await this.conversationRepository.find(
      { id: { $in: conversationIds } },
      { populate: ['members', 'members.user', 'lastMessage'] },
    );
    return conversations;
  }
}
