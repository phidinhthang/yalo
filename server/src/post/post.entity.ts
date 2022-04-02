import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  OneToMany,
  Collection,
  EntityRepositoryType,
  Index,
  Embedded,
} from '@mikro-orm/core';
import { NumReactions, Reaction } from '../common/entities/reaction.entity';
import { User } from '../user/user.entity';
import { CommentRepository, PostRepository } from './post.repository';

@Entity({ tableName: 'posts', customRepository: () => PostRepository })
export class Post {
  [EntityRepositoryType]?: PostRepository;

  @PrimaryKey()
  id: number;

  @Property()
  text: string;

  @ManyToOne(() => User, { onDelete: 'cascade' })
  creator: User;

  @Embedded(() => NumReactions, { object: true })
  numReactions?: NumReactions = {};

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions = new Collection<Reaction>(this);

  @Property({ default: 0 })
  numComments: number = 0;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments = new Collection<Comment>(this);

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

@Entity({ tableName: 'comments', customRepository: () => CommentRepository })
export class Comment {
  [EntityRepositoryType]?: CommentRepository;

  @PrimaryKey()
  id: number;

  @ManyToOne(() => User, { onDelete: 'cascade' })
  creator: User;

  @Index()
  @ManyToOne(() => Post, { onDelete: 'cascade' })
  post: Post;

  @Property()
  text: string;

  @Index()
  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}
