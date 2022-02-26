import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existed = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (existed) {
      throw new BadRequestException({
        errors: {
          username: ['username already exist'],
        },
      });
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
    });

    await this.userRepository.persistAndFlush(user);

    console.log('user ', user);

    return {
      user,
      token: {
        access: this.authService.signAccessToken(user),
        refresh: this.authService.signRefreshToken(user),
      },
    };
  }

  async login(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (!user) {
      throw new BadRequestException({
        errors: {
          username: ['username dont existed'],
        },
      });
    }

    const isMatched = await argon2.verify(
      user.password,
      createUserDto.password,
    );

    if (!isMatched) {
      throw new BadRequestException({
        errors: {
          password: ['password does not match'],
        },
      });
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
    return this.userRepository.findAll();
  }

  findOne(id: number) {
    return this.userRepository.findOne(id);
  }
}
