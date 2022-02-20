import { Entity, ManyToOne, PrimaryKeyType, Property } from '@mikro-orm/core';
import { User } from '../../user/user.entity';
import { Conversation } from './conversation.entity';

@Entity({ tableName: 'members' })
export class Member {
  @ManyToOne(() => Conversation, { primary: true, onDelete: 'cascade' })
  conversation: Conversation;

  @ManyToOne(() => User, { primary: true, onDelete: 'cascade' })
  user: User;

  [PrimaryKeyType]: [number, number];

  @Property({ nullable: true })
  lastReadAt?: Date;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  joinedAt: Date = new Date();
}
