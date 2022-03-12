import { Member } from './member.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ForbiddenException } from '@nestjs/common';

export class MemberRepository extends EntityRepository<Member> {
  private async isMember(
    userId: number,
    conversationId: number,
  ): Promise<boolean> {
    const isMemberExisted = await this.findOne({
      user: userId,
      conversation: conversationId,
    });
    return !!isMemberExisted;
  }

  async isMemberOrThrow(userId: number, conversationId: number): Promise<void> {
    const isMemberExisted = await this.isMember(userId, conversationId);

    if (!isMemberExisted) {
      throw new ForbiddenException({
        errors: {
          member: ['you are not a member in this conversation'],
        },
      });
    }
  }
}
