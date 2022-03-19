import { Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { MeId } from 'src/common/decorators/meId.decorator';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { FriendService } from './friend.service';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @UseGuards(HttpAuthGuard)
  @Get('/')
  paginatedFriends(@MeId() meId: number) {
    return this.friendService.paginatedFriends(meId);
  }

  @UseGuards(HttpAuthGuard)
  @Get('/search-user')
  searchUser(
    @MeId() meId: number,
    @Query('q') queriedUsernameStartsWith: string,
  ) {
    return this.friendService.searchUser(meId, queriedUsernameStartsWith);
  }

  @UseGuards(HttpAuthGuard)
  @Get('/requests')
  paginatedRequests(@MeId() meId: number) {
    return this.friendService.paginatedRequests(meId);
  }

  @UseGuards(HttpAuthGuard)
  @Get('/user/:userId/info')
  getUserInfo(
    @MeId() meId: number,
    @Param('userId', new ParseIntPipe()) userId: number,
  ) {
    return this.friendService.getUserInfo(meId, userId);
  }

  @UseGuards(HttpAuthGuard)
  @Post('/:targetId/request-friend')
  createRequest(
    @Param('targetId', new ParseIntPipe()) targetId: number,
    @MeId() meId: number,
  ) {
    return this.friendService.createRequest(meId, targetId);
  }

  @UseGuards(HttpAuthGuard)
  @Post('/:targetId/accept-request')
  acceptRequest(
    @Param('targetId', new ParseIntPipe()) targetId: number,
    @MeId() meId: number,
  ) {
    return this.friendService.acceptRequest(meId, targetId);
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/:targetId/cancel-request')
  cancelRequest(
    @Param('targetId', new ParseIntPipe()) targetId: number,
    @MeId() meId: number,
  ) {
    return this.friendService.cancelRequest(meId, targetId);
  }

  @UseGuards(HttpAuthGuard)
  @Delete('/:targetId/remove-friend')
  removeFriend(
    @Param('targetId', new ParseIntPipe()) targetId: number,
    @MeId() meId: number,
  ) {
    return this.friendService.removeFriend(meId, targetId);
  }
}
