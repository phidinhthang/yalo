import { ForbiddenException, Injectable } from '@nestjs/common';
import { MemberRepository } from './member.repository';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  private async isMember(
    userId: number,
    conversationId: number,
  ): Promise<boolean> {
    const isMemberExisted = await this.memberRepository.findOne({
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
