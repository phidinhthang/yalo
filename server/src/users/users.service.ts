import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from 'src/auth/auth.service';
import type { CreateUser, UserWithToken } from './users.dto';
import { UsersRepo } from './users.repo';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepo) private readonly usersRepo: UsersRepo,
    private readonly authService: AuthService,
  ) {}

  async register(createUserDto: CreateUser): Promise<UserWithToken> {
    const existed = await this.usersRepo.findOne({
      username: createUserDto.username,
    });

    if (existed) {
      throw new BadRequestException([
        {
          path: ['username'],
          message: 'username already existed',
        },
      ]);
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = await this.usersRepo.create({
      username: createUserDto.username,
      password: hashedPassword,
    });

    console.log('user ', user);

    return {
      user,
      token: {
        access: this.authService.signAccessToken(user),
        refresh: this.authService.signRefreshToken(user),
      },
    };
  }

  async login(createUserDto: CreateUser): Promise<UserWithToken> {
    const user = await this.usersRepo.findOne({
      username: createUserDto.username,
    });

    if (!user) {
      throw new BadRequestException([
        {
          path: ['username'],
          message: 'username dont existed',
        },
      ]);
    }

    const isMatched = await argon2.verify(
      user.password,
      createUserDto.password,
    );

    if (!isMatched) {
      throw new BadRequestException([
        {
          path: ['password'],
          message: 'Password does not matched',
        },
      ]);
    }

    return {
      user,
      token: {
        access: this.authService.signAccessToken(user),
        refresh: this.authService.signRefreshToken(user),
      },
    };
  }

  findAll() {
    return this.usersRepo.findAll();
  }

  findOne(id: number) {
    return this.usersRepo.findOne(id);
  }
}
