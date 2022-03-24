import { EntityManager } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { escape } from 'html-escaper';
import { CreateCommentDto, CreatePostDto } from './post.dto';
import { Post } from './post.entity';
import {
  CommentRepository,
  PostRepository,
  ReactionRepository,
} from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly commentRepository: CommentRepository,
    private readonly em: EntityManager,
  ) {}

  async create(meId: number, createPostDto: CreatePostDto) {
    const santiziedText = escape(createPostDto.text);
    const post = this.postRepository.create({
      text: santiziedText,
      creator: meId,
    });
    await this.postRepository.persistAndFlush(post);

    return post;
  }

  async getPost(meId: number, postId: number) {
    const res = await this.em.getConnection('read').execute(
      `select p.id, 
			p.creator_id as "creatorId",
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) creator,
			p.text, p.num_reactions as "numReactions", p.num_comments as "numComments",
      case when r.id is not null then true else false end as "reacted",
			p.created_at as "createdAt", p.updated_at as "updatedAt"
			from posts p
      inner join users u on u.id = p.creator_id
      left join reactions r on r.user_id = ? and r.post_id = ?
      where p.id = ? ;
      `,
      [meId, postId, postId],
    );
    const post = res?.[0];

    return post;
  }

  async delete(meId: number, postId: number) {
    await this.postRepository.nativeDelete({ id: postId, creator: meId });
    return true;
  }

  async createComment(
    meId: number,
    postId: number,
    { text }: CreateCommentDto,
  ) {
    // @todo check if user can have permission to create comment

    const post = await this.postRepository.findOne(postId);

    if (!post) {
      // @todo write better error response
      throw new NotFoundException();
    }

    const comment = this.commentRepository.create({
      creator: meId,
      post: postId,
      text: escape(text),
    });

    post.numComments += 1;

    await this.commentRepository.persistAndFlush([comment, post]);
    return comment;
  }

  async deleteComment(meId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      creator: meId,
      id: commentId,
    });

    if (!comment) {
      // @todo write better error response
      throw new NotFoundException();
    }

    await this.em.transactional(async (em) => {
      await em.getConnection('write').execute(
        `
				delete from comments where creator_id = ? and id = ?`,
        [meId, commentId],
      );
      await em
        .getConnection('write')
        .execute(
          `update posts set num_comments = num_comments - 1 where id = ?`,
          [comment.post.id],
        );
    });

    return true;
  }

  async paginatedComments(
    meId: number,
    postId: number,
    { nextCursor, limit }: { nextCursor?: string; limit?: number },
  ) {
    // @todo check if user has permission to view comments by meId and postId
    limit = Math.min(limit || 3, 20);
    const limitPlusOne = limit + 1;

    const comments = await this.em.getConnection('read').execute(
      `select c.id,
      c.text,
      c.created_at as "createdAt",
      c.creator_id as "creatorId",
      c.post_id as "postId",
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) as creator
      from comments c
      inner join users u on u.id = c.creator_id
      where c.post_id = ? and ${
        typeof nextCursor === 'string' ? `c.created_at < ?` : `1 = 1`
      }
      order by c.created_at desc
      limit ?
      ;`,
      [postId, nextCursor, limitPlusOne],
    );

    let _nextCursor: string | undefined = undefined;
    if (comments.length === limitPlusOne) {
      _nextCursor = comments[comments.length - 1]?.createdAt.toISOString();
    }

    return {
      data: comments.slice(0, limit),
      nextCursor: _nextCursor,
    };
  }

  async paginated(
    meId: number,
    { nextCursor, limit }: { nextCursor?: string; limit?: number },
  ) {
    limit = Math.min(limit || 3, 20);
    const limitPlusOne = limit + 1;
    const replacement: Array<string | number> = [
      meId,
      meId,
      meId,
      nextCursor,
      limitPlusOne,
    ];
    // @todo check if user can have permission to view posts

    const posts: Post[] = await this.em.getConnection('read').execute(
      `
			select p.id, 
			p.creator_id as "creatorId",
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) creator,
			p.text, p.num_reactions as "numReactions",
      p.num_comments as "numComments",
      case when r.id is not null then true else false end as "reacted",
			p.created_at as "createdAt", p.updated_at as "updatedAt"
			from posts p
      inner join users u on u.id = p.creator_id
			left join user_friends uf on uf.friend_id = p.creator_id and uf.user_id = ?
      left join reactions r on r.user_id = ? and r.post_id = p.id
			where (p.creator_id = ? or p.creator_id = uf.friend_id) and ${
        typeof nextCursor === 'string' ? `p.created_at <= ?` : `1 + 1 = 2`
      }
			order by p.created_at desc
			limit ? ;
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
            `update posts set num_reactions = num_reactions - 1 where id = ?`,
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
