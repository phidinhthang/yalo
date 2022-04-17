import { Post } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { ParseEnumPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { MeId } from 'src/common/decorators/meId.decorator';
import { ReactionValue } from 'src/common/entities/reaction.entity';
import { FilesToBodyInterceptor } from 'src/common/file.interceptor';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { CreateCommentDto, CreatePostDto } from './post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(HttpAuthGuard)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'), FilesToBodyInterceptor)
  create(@MeId() meId: number, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(meId, createPostDto);
  }

  @UseGuards(HttpAuthGuard)
  @Get('/:postId')
  getPost(
    @MeId() meId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
  ) {
    return this.postService.getPost(meId, postId);
  }

  @UseGuards(HttpAuthGuard)
  @Post('/:postId/reaction')
  reactsToPost(
    @MeId() meId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query('value', new ParseEnumPipe(ReactionValue)) value: ReactionValue,
    @Query('action') action: 'remove' | 'create',
  ) {
    if (action !== 'remove' && action !== 'create')
      throw new BadRequestException();

    return this.postService.reactsToPost(meId, postId, value, action);
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/:postId')
  async delete(
    @MeId() meId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
  ) {
    return this.postService.delete(meId, postId);
  }

  @UseGuards(HttpAuthGuard)
  @Get()
  paginated(
    @MeId() meId: number,
    @Query() q: { limit?: number; nextCursor?: string },
  ) {
    return this.postService.paginated(meId, q);
  }

  @UseGuards(HttpAuthGuard)
  @Get('/:postId/comment')
  paginatedComments(
    @MeId() meId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query() q: { limit?: number; nextCursor?: string },
  ) {
    return this.postService.paginatedComments(meId, postId, q);
  }

  @UseGuards(HttpAuthGuard)
  @Post('/:postId/comment')
  createComment(
    @MeId() meId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postService.createComment(meId, postId, createCommentDto);
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/:commentId/comment')
  deleteComment(
    @MeId() meId: number,
    @Param('commentId', new ParseIntPipe()) commentId: number,
  ) {
    return this.postService.deleteComment(meId, commentId);
  }
}
