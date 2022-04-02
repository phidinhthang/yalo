import {
  Entity,
  Index,
  EntityRepositoryType,
  PrimaryKey,
  ManyToOne,
  Property,
  Enum,
  Embeddable,
} from '@mikro-orm/core';
import { Post } from '../../post/post.entity';
import { Message } from '../../message/message.entity';
import { User } from '../../user/user.entity';
import { EntityRepository } from '@mikro-orm/postgresql';

@Entity({ tableName: 'reactions', customRepository: () => ReactionRepository })
export class Reaction {
  [EntityRepositoryType]?: ReactionRepository;

  @PrimaryKey()
  id: number;

  @Enum(() => ReactionValue)
  value: ReactionValue;

  @Enum(() => ReactionType)
  type: ReactionType;

  @ManyToOne(() => User, { onDelete: 'cascade' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'cascade', nullable: true })
  post: Post;

  @ManyToOne(() => Message, { onDelete: 'cascade', nullable: true })
  message: Message;

  @Index()
  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

@Embeddable()
export class NumReactions {
  @Property()
  like?: number = 0;

  @Property()
  love?: number = 0;

  @Property()
  haha?: number = 0;

  @Property()
  wow?: number = 0;

  @Property()
  sad?: number = 0;

  @Property()
  angry?: number = 0;
}

export enum ReactionValue {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export enum ReactionType {
  MESSAGE = 'm',
  POST = 'p',
}

export class ReactionRepository extends EntityRepository<Reaction> {}
