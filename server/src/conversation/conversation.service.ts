import { MikroORM } from '@mikro-orm/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { User } from 'src/user/user.entity';
import { ConversationRepository } from './conversation.repository';
import { ConversationType } from './conversation.entity';
import { CreateGroupConversationDto, ChangeTitleDto } from './conversation.dto';
import { UserRepository } from 'src/user/user.repository';
import { SocketService } from 'src/socket/socket.service';
import { MemberRepository } from '../member/member.repository';
import { NotFoundException } from '@nestjs/common';

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
      membersPreview: [me, partner],
    });

    await this.orm.em.persistAndFlush([meMember, partnerMember, conversation]);
    return conversation;
  }

  async createGroupConversation(
    meId: number,
    { title, memberIds }: CreateGroupConversationDto,
  ) {
    if (memberIds.includes(meId)) {
      throw new BadRequestException({
        errors: {
          memberIds: ['cannot contain yourself'],
        },
      });
    }

    memberIds.push(meId);
    const [userToAdd, memberCount] = await this.userRepository.findAndCount({
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

    let conversation = this.conversationRepository.create({
      title,
      admin: meId,
      type: ConversationType.GROUP,
      inviteLinkToken: nanoid(9),
      membersPreview: userToAdd.slice(0, 4),
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

  async getGroupPreview(inviteLinkToken: string) {
    const conversation = await this.conversationRepository.findOne(
      {
        inviteLinkToken,
      },
      { populate: ['admin', 'lastMessage', 'members', 'members.user'] },
    );

    if (!conversation) {
      throw new NotFoundException({
        errors: {
          conversation: ['conversation not found'],
        },
      });
    }

    return conversation;
  }

  async joinGroupByLink(userId: number, inviteLinkToken: string) {
    const conversation = await this.conversationRepository.findOne({
      inviteLinkToken,
    });
    if (!conversation) {
      throw new NotFoundException({
        errors: {
          conversation: ['conversation not found'],
        },
      });
    }
    const user = await this.userRepository.findOne(userId);
    const memberExisted = await this.memberRepository.findOne({
      user: user,
      conversation: conversation.id,
    });

    if (memberExisted) {
      return true;
    }

    const newMember = this.memberRepository.create({
      user: userId,
      conversation: conversation.id,
    });

    if (conversation.membersPreview.length < 4) {
      conversation.membersPreview.push({
        id: user.id,
        avatarUrl: user.avatarUrl,
        username: user.username,
      });
      await this.conversationRepository.persistAndFlush([conversation]);
    }
    await this.memberRepository.persistAndFlush([newMember]);
    return newMember;
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
    } else {
      conversation.membersPreview = conversation.membersPreview.filter(
        (m) => m.id !== meId,
      );
      console.log('members preview', conversation.membersPreview);
      const memberToPreviews = conversation.members
        .getItems()
        .filter((m) => {
          return !!conversation.membersPreview.every(
            (preview) => preview.id !== m.user.id && m.user.id !== meId,
          );
        })
        .slice(0, 4 - conversation.membersPreview.length);
      console.log('member to preview ', memberToPreviews);
      if (memberToPreviews.length) {
        const users = await this.userRepository.find({
          id: { $in: [...memberToPreviews.map((m) => m.user.id)] },
        });
        conversation.membersPreview.push(...users);
        await this.conversationRepository.persistAndFlush(conversation);
      }
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
    const conversation = await this.conversationRepository.findOneOrFail(
      {
        id: conversationId,
        type: ConversationType.GROUP,
        admin: meId,
      },
      { populate: ['members'] },
    );
    await this.memberRepository.nativeDelete({
      user: userId,
      conversation: conversationId,
    });

    conversation.membersPreview = conversation.membersPreview.filter(
      (m) => m.id !== userId,
    );
    const memberToPreviews = conversation.members
      .getItems()
      .filter((m) => {
        return !!conversation.membersPreview.every(
          (preview) => preview.id !== m.user.id && m.user.id !== userId,
        );
      })
      .slice(0, 4 - conversation.membersPreview.length);
    if (memberToPreviews.length) {
      const users = await this.userRepository.find({
        id: { $in: [...memberToPreviews.map((m) => m.user.id)] },
      });
      conversation.membersPreview.push(...users);
    }
    await this.conversationRepository.persistAndFlush(conversation);
    await this.socketService.memberKicked(conversation, userId);

    return true;
  }

  async addMember(meId: number, userIds: number[], conversationId: number) {
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
    const oldMembers = await this.memberRepository.find({
      conversation: conversationId,
    });
    const conversation = await this.conversationRepository.findOne(
      conversationId,
      { populate: ['lastMessage'] },
    );
    const userIdsToAdd = userIds.filter(
      (uId) => !oldMembers.some((m) => m.user.id === uId),
    );

    const usersToAdd = await this.userRepository.find({
      id: { $in: userIdsToAdd },
    });

    const newMembers = usersToAdd.map((u) =>
      this.memberRepository.create({
        user: u,
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
    const membersToAddPreview = _newMembers
      .filter((m) => {
        return !!conversation.membersPreview.every(
          (preview) => preview.id !== m.user.id,
        );
      })
      .slice(0, 4 - conversation.membersPreview.length)
      .map((m) => m.user);
    if (membersToAddPreview.length) {
      conversation.membersPreview.push(...membersToAddPreview);
      await this.conversationRepository.persistAndFlush([conversation]);
    }

    await this.socketService.newMember(conversation, oldMembers, newMembers);
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
    const result = await this.conversationRepository.qb().raw(
      `
      select c.id, c.title, c.type, c.admin_id,
      c.invite_link_token as "inviteLinkToken",
      c.created_at as "createdAt",
      c.members_preview as "membersPreview",
      json_build_object(
        'id', last_msg.id,
        'text', last_msg.text,
        'images', last_msg.images,
        'isDeleted', last_msg.is_deleted,
        'createdAt', last_msg.created_at
      ) as "lastMessage",
      json_build_object(
        'id', u_partner.id,
        'isOnline', u_partner.is_online,
        'username', u_partner.username,
        'avatarUrl', u_partner.avatar_url,
        'lastLoginAt', u_partner.last_login_at
      ) as "partner"
      from conversations c
      inner join members m on m.user_id = ? and m.conversation_id = c.id
      left join members as m_partner 
      on m_partner.user_id != ? and m_partner.conversation_id = c.id and c.type = 'private'
      left join users u_partner on u_partner.id = m_partner.user_id
      left join messages last_msg on c.last_message_id = last_msg.id
      order by coalesce(last_msg.created_at, c.created_at) desc;
    `,
      [meId, meId],
    );
    console.log('conversations ', result.rows);
    return result.rows;
  }

  async getById(meId: number, conversationId: number) {
    await this.memberRepository.isMemberOrThrow(meId, conversationId);
    const conversation = await this.conversationRepository.findOne(
      {
        id: conversationId,
      },
      { populate: ['members', 'members.user'] },
    );

    return conversation;
  }
}
