import { Member } from './member.entity';
import { EntityRepository } from '@mikro-orm/postgresql';

export class MemberRepository extends EntityRepository<Member> {}
