import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/ZodValidationPipe';
import { UsersService } from './users.service';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/guards/meId.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetUserDto,
  GetUsersDto,
  GetUserWithTokenDto,
  CreateUserDto,
  CreateUser,
  UserWithToken,
  GetUsers,
} from './users.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UsePipes(ZodValidationPipe)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('refresh_token')
  refreshToken() {
    return {
      accessToken: '',
    };
  }

  @UseGuards(HttpAuthGuard)
  @Get('me')
  @ApiResponse({
    type: GetUserDto,
  })
  async getMe(@MeId() userId?: number) {
    console.log('user id', userId);
    if (!userId) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    return this.usersService.findOne(userId);
  }

  @Post('register')
  @ApiCreatedResponse({
    type: GetUserWithTokenDto,
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto as CreateUser);
  }

  @Post('login')
  @ApiResponse({
    type: GetUserWithTokenDto,
  })
  login(@Body() createUserDto: CreateUserDto) {
    return this.usersService.login(createUserDto as CreateUser);
  }

  @Get()
  @ApiResponse({
    type: GetUsersDto,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @ApiResponse({
    type: GetUserDto,
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }
}
