import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './post.dto';
import { Post } from './post.entity';
import { PostRepository, ReactionRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly em: EntityManager,
  ) {}

  async create(meId: number, createPostDto: CreatePostDto) {
    const post = this.postRepository.create({
      text: createPostDto.text,
      creator: meId,
    });
    await this.postRepository.persistAndFlush(post);

    return post;
  }

  async delete(meId: number, postId: number) {
    await this.postRepository.nativeDelete({ id: postId, creator: meId });
    return true;
  }

  async paginated(
    meId: number,
    { nextCursor, limit }: { nextCursor?: string; limit?: number },
  ) {
    limit = Math.min(limit || 3, 20);
    const limitPlusOne = limit + 1;
    const replacement: Array<string | number> = [meId, meId];
    if (typeof nextCursor === 'string') replacement.push(nextCursor);
    replacement.push(limitPlusOne);
    const posts: Post[] = await this.em.getConnection('read').execute(
      `
			select p.id, 
			p.creator_id as "creatorId", 
			p.text, p.num_reactions as "numReactions",
			p.created_at as "createdAt", p.updated_at as "updatedAt"
			from posts p
			inner join user_friends uf on uf.friend_id = p.creator_id and uf.user_id = ?
			where (p.creator_id = ? or p.creator_id = uf.friend_id) and ${
        nextCursor ? `p.created_at < ?` : `1 + 1 = 2`
      }
			order by p.created_at desc
			limit ?
		`,
      replacement,
    );
    let _nextCursor: string | undefined = undefined;
    if (posts.length === limitPlusOne) {
      _nextCursor = posts[posts.length - 1]?.createdAt.toISOString();
    }

    return {
      data: posts.slice(0, limit),
      nextCursor: _nextCursor,
    };
  }

  async reactsToPost(meId: number, postId: number, value: number) {
    const like = value === 1 ? true : false;
    let reaction = await this.reactionRepository.findOne({
      user: meId,
      post: postId,
    });
    if (reaction && !like) {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `
				delete from reactions where user_id = ? and post_id = ?`,
          [meId, postId],
        );
        await em
          .getConnection('write')
          .execute(
            `update posts set num_reactions = num_reactions -1 where id = ?`,
            [postId],
          );
      });
    } else if (!reaction && like) {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `insert into reactions (user_id, post_id) values (?, ?);
					`,
          [meId, postId],
        );
        await em
          .getConnection('write')
          .execute(
            `update posts set num_reactions = num_reactions + 1 where id = ?`,
            [postId],
          );
      });
    }

    return true;
  }
}
