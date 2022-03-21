import { Post } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { MeId } from 'src/common/decorators/meId.decorator';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { CreatePostDto } from './post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(HttpAuthGuard)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  create(@MeId() meId: number, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(meId, createPostDto);
  }

  @UseGuards(HttpAuthGuard)
  @Post('/:postId/reaction')
  reactsToPost(
    @MeId() meId: number,
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query('value', new ParseIntPipe()) value: number,
  ) {
    return this.postService.reactsToPost(meId, postId, value);
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
}
