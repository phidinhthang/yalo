import { MikroORM } from '@mikro-orm/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { ConversationRepository } from './conversation.repository';
import { ConversationType } from './conversation.entity';
import { CreateGroupConversationDto, ChangeTitleDto } from './conversation.dto';
import { UserRepository } from 'src/user/user.repository';
import { SocketService } from 'src/socket/socket.service';
import { MemberRepository } from '../member/member.repository';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly memberRepository: MemberRepository,
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
    if (memberIds.includes(meId)) {
      throw new BadRequestException({
        errors: {
          memberIds: ['cannot contain yourself'],
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

  async changeTitle(
    meId: number,
    conversationId: number,
    changeTitleDto: ChangeTitleDto,
  ) {
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
    const conversation = await this.conversationRepository.findOne(
      conversationId,
    );
    if (conversation.title === changeTitleDto.title) return true;
    if (conversation.type === ConversationType.PRIVATE) {
      conversation.title = changeTitleDto.title;
    } else if (
      conversation.type === ConversationType.GROUP &&
      conversation.admin.id === meId
    ) {
      conversation.title = changeTitleDto.title;
    }

    await this.conversationRepository.persistAndFlush(conversation);

    return true;
  }

  async leaveGroupConversation(meId: number, conversationId: number) {
    let conversationDeletedReason: undefined | 'admin_leave' | 'member_count';
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
    const conversation = await this.conversationRepository.findOne(
      { id: conversationId, type: ConversationType.GROUP },
      { populate: ['members'] },
    );
    if (conversation?.admin.id === meId) {
      conversationDeletedReason = 'admin_leave';
    }
    await this.memberRepository.nativeDelete({
      conversation: conversationId,
      user: meId,
    });
    const memberCount = await this.memberRepository.count({
      conversation: conversationId,
    });

    console.log('member count ', memberCount);

    if (memberCount <= 2) {
      conversationDeletedReason = 'member_count';
    }
    if (conversationDeletedReason) {
      await this.conversationRepository.nativeDelete(conversationId);
    }

    await this.socketService.leaveConversation(
      meId,
      conversation,
      conversationDeletedReason,
    );

    return true;
  }

  async deleteGroupConversation(meId: number, conversationId: number) {
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
    const conversation = await this.conversationRepository.findOne(
      { admin: meId, type: ConversationType.GROUP, id: conversationId },
      { populate: ['members'] },
    );
    const admin = conversation?.admin;
    if (!admin) {
      throw new BadRequestException({
        errors: {
          conversationId: [
            'You do not have permission to delete the conversation',
          ],
        },
      });
    }

    await this.conversationRepository.nativeDelete(conversationId);
    await this.socketService.deleteConversation(meId, conversation);

    return true;
  }

  async kickMember(meId: number, userId: number, conversationId: number) {
    await this.memberRepository.isMemberOrThrow(userId, conversationId);
    await this.conversationRepository.findOneOrFail({
      id: conversationId,
      type: ConversationType.GROUP,
      admin: meId,
    });
    await this.memberRepository.nativeDelete({
      user: userId,
      conversation: conversationId,
    });
  }

  async addMember(meId: number, userIds: number[], conversationId: number) {
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
    const members = await this.memberRepository.find({
      conversation: conversationId,
    });
    const userIdsToAdd = userIds.filter(
      (uId) => !members.some((m) => m.user.id === uId),
    );

    const newMembers = userIdsToAdd.map((uId) =>
      this.memberRepository.create({
        user: uId,
        conversation: conversationId,
      }),
    );

    await this.memberRepository.persistAndFlush(newMembers);
    const _newMembers = await this.memberRepository.find(
      {
        conversation: conversationId,
        user: { $in: userIdsToAdd },
      },
      { populate: ['user'] },
    );
    return _newMembers;
  }

  async markReadMsg(meId: number, conversationId: number) {
    const member = await this.memberRepository.findOne({
      user: meId,
      conversation: conversationId,
    });
    if (!member) {
      throw new BadRequestException({
        errors: {
          member: ['member do not exists'],
        },
      });
    }
    member.lastReadAt = new Date();
    await this.memberRepository.persistAndFlush(member);
    await this.socketService.markReadMsg(
      meId,
      conversationId,
      member.lastReadAt!,
    );

    return true;
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
