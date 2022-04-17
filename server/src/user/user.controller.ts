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
  UseInterceptors,
} from '@nestjs/common';
import { ValidationPipe } from '../common/validation.pipe';
import { UsersService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/decorators/meId.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ChangeAvatarDto, CreateUserDto, RefreshTokenDto } from './user.dto';
import { config } from '../common/config';
import { DevGuard } from 'src/common/guards/dev.guard';
import { Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileToBodyInterceptor } from 'src/common/file.interceptor';

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
      throw new UnauthorizedException();
    }
  }

  @UseGuards(HttpAuthGuard)
  @Get('me')
  async getMe(@MeId() userId?: number) {
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

  @UseGuards(HttpAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'), FileToBodyInterceptor)
  @Post('change-avatar')
  changeAvatar(@MeId() meId: number, @Body() changeAvatarDto: ChangeAvatarDto) {
    return this.usersService.changeAvatar(meId, changeAvatarDto);
  }

  @UseGuards(HttpAuthGuard)
  @Delete('remove-avatar')
  removeAvatar(@MeId() meId: number) {
    return this.usersService.removeAvatar(meId);
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
