import { EntityManager } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { escape } from 'html-escaper';
import {
  ReactionRepository,
  ReactionValue,
} from 'src/common/entities/reaction.entity';
import { UserFriendRepository } from 'src/friend/friend.repository';
import { NotificationService } from 'src/notification/notification.service';
import { SocketService } from 'src/socket/socket.service';
import { UserRepository } from 'src/user/user.repository';
import { CreateCommentDto, CreatePostDto } from './post.dto';
import { Post } from './post.entity';
import { CommentRepository, PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userFriendRepository: UserFriendRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
    private readonly socketService: SocketService,
    private readonly em: EntityManager,
  ) {}

  async create(meId: number, createPostDto: CreatePostDto) {
    const santiziedText = escape(createPostDto.text);
    const me = await this.userRepository.findOne(meId);
    const post = this.postRepository.create({
      text: santiziedText,
      creator: me,
    });
    await this.postRepository.persistAndFlush(post);
    await this.socketService.newPost(post);

    const friends = await this.userFriendRepository.getFriends(meId);

    this.notificationService
      .create({
        actorId: meId,
        entityId: post.id,
        entityTypeId: 1,
        notifierIds: friends.map((f) => f.id),
      })
      .then(() => {});

    return post;
  }

  async getPost(meId: number, postId: number) {
    await this.postRepository.canViewPostOrThrow(meId, postId);

    const res = await this.em.getConnection('read').execute(
      `select p.id, 
			p.creator_id as "creatorId",
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) creator,
			p.text, p.num_reactions as "numReactions", p.num_comments as "numComments",
      case when r.id is not null then r.value else null end as "reaction",
			p.created_at as "createdAt", p.updated_at as "updatedAt"
			from posts p
      inner join users u on u.id = p.creator_id
      left join reactions r on r.user_id = ? and r.post_id = ? and r.type = 'p'
      where p.id = ? ;
      `,
      [meId, postId, postId],
    );
    const post = res?.[0];

    return post;
  }

  async delete(meId: number, postId: number) {
    const post = await this.postRepository.findOne({
      id: postId,
      creator: meId,
    });
    await this.postRepository.removeAndFlush(post);
    await this.socketService.postDeleted(meId, post);
    return true;
  }

  async createComment(
    meId: number,
    postId: number,
    { text }: CreateCommentDto,
  ) {
    await this.postRepository.canViewPostOrThrow(meId, postId);
    const me = await this.userRepository.findOne(meId);

    const post = await this.postRepository.findOne(postId);

    if (!post) {
      // @todo write better error response
      throw new NotFoundException();
    }

    const comment = this.commentRepository.create({
      creator: me,
      post: postId,
      text: escape(text),
    });

    post.numComments += 1;

    await this.commentRepository.persistAndFlush([comment, post]);
    this.socketService.newComment(post.id, comment).then(() => {});
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
    await this.postRepository.canViewPostOrThrow(meId, postId);
    limit = Math.min(limit || 3, 20);
    const limitPlusOne = limit + 1;
    const replacement =
      typeof nextCursor === 'string'
        ? [postId, nextCursor, limitPlusOne]
        : [postId, limitPlusOne];

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
        typeof nextCursor === 'string' ? `c.created_at <= ?` : `1 = 1`
      }
      order by c.created_at desc
      limit ?
      ;`,
      replacement,
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
    const replacement: Array<string | number> =
      typeof nextCursor === 'string'
        ? [meId, meId, meId, nextCursor, limitPlusOne]
        : [meId, meId, meId, limitPlusOne];

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
      case when r.id is not null then r.value else null end as "reaction",
			p.created_at as "createdAt", p.updated_at as "updatedAt"
			from posts p
      inner join users u on u.id = p.creator_id
			left join user_friends uf on uf.friend_id = p.creator_id and uf.user_id = ?
      left join reactions r on r.user_id = ? and r.post_id = p.id and r.type = 'p'
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

  async reactsToPost(
    meId: number,
    postId: number,
    value: ReactionValue,
    action: 'create' | 'remove',
  ) {
    await this.postRepository.canViewPostOrThrow(meId, postId);
    let reaction = await this.reactionRepository.findOne({
      user: meId,
      post: postId,
    });
    if (reaction && action === 'remove') {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `
				delete from reactions where user_id = ? and post_id = ?`,
          [meId, postId],
        );
        await em.getConnection('write').execute(
          `update posts set num_reactions = 
            num_reactions || concat(?, coalesce(num_reactions->>?, '1')::int - 1, '}')::jsonb where posts.id = ?;
            `,
          [`{"${value}":`, `${value}`, postId],
        );
      });
    } else if (!reaction && action === 'create') {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `insert into reactions (user_id, post_id, value, type) values (?, ?, ?, ?);
					`,
          [meId, postId, value, 'p'],
        );
        await em.getConnection('write').execute(
          `update posts set num_reactions = 
            num_reactions || concat(?, coalesce(num_reactions->>?, '0')::int + 1, '}')::jsonb where posts.id = ?;
            `,
          [`{"${value}":`, `${value}`, postId],
        );
      });
    } else if (reaction && action === 'create' && reaction.value !== value) {
      await this.em.transactional(async (em) => {
        await em.getConnection('write').execute(
          `update reactions set value = ? 
          where user_id = ? and post_id = ? and type = ? 
					`,
          [value, meId, postId, 'p'],
        );
        await em.getConnection('write').execute(
          `update posts set num_reactions = 
            num_reactions || concat(?, coalesce(num_reactions->>?, '0')::int + 1, '}')::jsonb 
            || concat(?, coalesce(num_reactions->>?, '1')::int - 1, '}')::jsonb
            where posts.id = ?;
            `,
          [
            `{"${value}":`,
            `${value}`,
            `{"${reaction.value}":`,
            `${reaction.value}`,
            postId,
          ],
        );
      });
    }

    return true;
  }
}
