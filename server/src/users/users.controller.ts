import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpAuthGuard } from 'src/common/guards/httpAuth.guard';
import { MeId } from 'src/common/guards/meId.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
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
  async getMe(@MeId() userId?: number) {
    console.log('user id', userId);
    if (!userId) {
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    return this.usersService.findOne(userId);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  login(@Body() createUserDto: CreateUserDto) {
    return this.usersService.login(createUserDto);
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
