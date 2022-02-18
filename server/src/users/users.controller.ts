import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  UnauthorizedException,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/ZodValidationPipe';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
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
  RefreshTokenDto,
} from './users.dto';
import { config } from '../common/config';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UsePipes(ZodValidationPipe)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @Post('refresh_token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded: any = this.authService.verify(
        refreshTokenDto.refreshToken,
        config.refreshTokenSecret,
      );
      const userId = decoded.userId;
      return {
        accessToken: this.authService.signAccessToken({ id: userId } as any),
      };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
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
