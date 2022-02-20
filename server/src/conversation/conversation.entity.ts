import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  OneToOne,
  Enum,
  EntityRepositoryType,
} from '@mikro-orm/core';
import { Message } from '../message/message.entity';
import { User } from '../user/user.entity';
import { ConversationRepository } from './conversation.repository';
import { Member } from '../member/member.entity';

@Entity({
  tableName: 'conversations',
  customRepository: () => ConversationRepository,
})
export class Conversation {
  [EntityRepositoryType]?: ConversationRepository;

  @PrimaryKey()
  id: number;

  @Property({ nullable: true })
  title?: string;

  @Enum(() => ConversationType)
  type: ConversationType;

  @ManyToOne(() => User, { nullable: true })
  admin?: User;

  @OneToMany(() => Member, (member) => member.conversation)
  members = new Collection<Member>(this);

  @OneToMany(() => Message, (message) => message.conversation)
  messages = new Collection<Message>(this);

  @OneToOne({ entity: () => Message, nullable: true })
  lastMessage?: Message;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}
