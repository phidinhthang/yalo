import { EntityRepository } from '@mikro-orm/postgresql';
import { BadRequestException } from '@nestjs/common';
import { Post, Comment } from './post.entity';

export class PostRepository extends EntityRepository<Post> {
  private async canViewPost(meId: number, postId: number) {
    const res = await this.qb('p').raw(
      `
				select p.id from posts p
				left join user_friends uf on uf.friend_id = p.creator_id and uf.user_id = ?
				where (p.creator_id = ? or p.creator_id = uf.friend_id) and p.id = ?
				limit 1
			`,
      [meId, meId, postId],
    );

    console.log('res ', res);
    return !!res?.rows?.[0].id;
  }

  public async canViewPostOrThrow(meId: number, postId: number): Promise<void> {
    const canViewPost = await this.canViewPost(meId, postId);
    if (!canViewPost) {
      throw new BadRequestException();
    }
  }
}
export class CommentRepository extends EntityRepository<Comment> {}
