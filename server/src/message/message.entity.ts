import {
  Property,
  PrimaryKey,
  Entity,
  ManyToOne,
  EntityRepositoryType,
  Embeddable,
  Embedded,
  Index,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { Conversation } from '../conversation/conversation.entity';
import { MessageRepository } from './message.repository';
import { NumReactions, Reaction } from '../common/entities/reaction.entity';

@Entity({ tableName: 'messages', customRepository: () => MessageRepository })
export class Message {
  [EntityRepositoryType]?: MessageRepository;

  @PrimaryKey()
  id: number;

  @ManyToOne(() => User, { onDelete: 'cascade' })
  creator: User;

  @ManyToOne(() => Conversation, { onDelete: 'cascade' })
  conversation: Conversation;

  @Property({ nullable: true })
  text?: string;

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions = new Collection<Reaction>(this);

  @Embedded(() => NumReactions, { object: true })
  numReactions: NumReactions;

  @Embedded(() => Image, { nullable: true, object: true, array: true })
  images?: Image[];

  @Embedded(() => File, { nullable: true, object: true, array: true })
  files?: File[];

  @Property({ default: false, defaultRaw: 'false' })
  isDeleted: boolean = false;

  @Index()
  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

@Embeddable()
export class Image {
  @Property({ columnType: 'text' })
  url: string;
}

@Embeddable()
export class File {
  @Property({ columnType: 'text' })
  url: string;

  @Property()
  fileName: string;

  @Property()
  fileSize: number;
}
