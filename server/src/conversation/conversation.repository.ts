import { EntityRepository } from '@mikro-orm/postgresql';
import { Conversation } from './conversation.entity';

export class ConversationRepository extends EntityRepository<Conversation> {}
