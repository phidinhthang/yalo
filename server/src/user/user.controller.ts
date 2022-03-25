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
import { ValidationPipe } from '../common/validation.pipe';
import { UsersService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/decorators/meId.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, RefreshTokenDto } from './user.dto';
import { config } from '../common/config';
import { DevGuard } from 'src/common/guards/dev.guard';
import { Delete } from '@nestjs/common';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UsePipes(new ValidationPipe())
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
  async getMe(@MeId() userId?: number) {
    console.log('user id', userId);
    if (!userId) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    return this.usersService.findOne(userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  login(@Body() createUserDto: CreateUserDto) {
    return this.usersService.login(createUserDto);
  }

  @UseGuards(DevGuard)
  @UseGuards(HttpAuthGuard)
  @Delete('/dev/delete-account')
  devUnsafeDeleteAccount(@MeId() meId: number) {
    return this.usersService.devUnsafeDeleteAccount(meId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }
}
