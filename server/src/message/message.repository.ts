import { EntityRepository } from '@mikro-orm/postgresql';
import { Message } from './message.entity';

export class MessageRepository extends EntityRepository<Message> {}
