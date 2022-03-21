import { EntityRepository } from '@mikro-orm/postgresql';
import { Post, Reaction } from './post.entity';

export class PostRepository extends EntityRepository<Post> {}
export class ReactionRepository extends EntityRepository<Reaction> {}
