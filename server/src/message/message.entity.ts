import {
  Property,
  PrimaryKey,
  Entity,
  ManyToOne,
  EntityRepositoryType,
  Embeddable,
  Embedded,
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

  @ManyToOne(() => Conversation, { onDelete: 'cascade' })
  conversation: Conversation;

  @Property({ nullable: true })
  text?: string;

  @Embedded(() => Image, { nullable: true, object: true, array: true })
  images?: Image[];

  @Property({ default: false, defaultRaw: 'false' })
  isDeleted: boolean = false;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

@Embeddable()
export class Image {
  @Property({ columnType: 'text' })
  url: string;
}
