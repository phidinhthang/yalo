import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { ConversationRepository } from './conversation.repository';
import { ConversationType } from './conversation.entity';
import { Member } from '../member/member.entity';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    @InjectRepository(Member)
    private readonly memberRepository: EntityRepository<Member>,
    private readonly orm: MikroORM,
  ) {}

  async findOrCreatePrivate(meId: number, partnerId: number) {
    const conversationId = await this.orm.em.getConnection('read').execute(`
		select c.id from members m1 
			inner join conversations c on c.id = m1.conversation_id and c.type = 'private'
				inner join members m2 on m2.user_id = ${partnerId} and m2.conversation_id = c.id
					where m1.user_id = ${meId};
		`);
    const meReference = this.orm.em.getReference(User, meId);
    const partnerReference = this.orm.em.getReference(User, partnerId);
    const meMember = this.memberRepository.create({
      conversation: conversationId,
      user: meReference,
    });
    const partnerMember = this.memberRepository.create({
      conversation: conversationId,
      user: partnerReference,
    });
    const conversation = await this.conversationRepository.upsert(
      conversationId,
      {
        members: [meMember, partnerMember],
        type: ConversationType.PRIVATE,
      },
      { populate: ['members', 'members.user'] as any },
    );

    return conversation;
  }

  async paginated(meId: number) {
    const members = await this.memberRepository.find({user: meId})
    const conversationIds = members.map(m => m.conversation.id)
    const conversations = await this.conversationRepository.find(
      { id: {$in: conversationIds}},
      { populate: ['members', 'members.user'] },
    );
    return conversations;
  }
}
