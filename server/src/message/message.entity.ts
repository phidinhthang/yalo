import {
  Property,
  PrimaryKey,
  Entity,
  ManyToOne,
  EntityRepositoryType,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { Conversation } from '../conversation/conversation.entity';
import { MessageRepository } from './message.repository';

@Entity({ tableName: 'messages', customRepository: () => MessageRepository })
export class Message {
  [EntityRepositoryType]?: MessageRepository;

  @PrimaryKey()
  id: number;

  @ManyToOne(() => User)
  creator: User;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @Property()
  text: string;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}
