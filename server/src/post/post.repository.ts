import { EntityRepository } from '@mikro-orm/postgresql';
import { Post, Reaction, Comment } from './post.entity';

export class PostRepository extends EntityRepository<Post> {}
export class ReactionRepository extends EntityRepository<Reaction> {}
export class CommentRepository extends EntityRepository<Comment> {}
