import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SocketService } from 'src/socket/socket.service';
import { ChangeAvatarDto, CreateUserDto } from './user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly socketService: SocketService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existed = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (existed) {
      throw new BadRequestException({
        errors: {
          username: ['exist'],
        },
      });
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
    });

    await this.userRepository.persistAndFlush(user);

    this.socketService.newUser(user);

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
          username: ['not-exist'],
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
          password: ['not-match'],
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

  async changeAvatar(meId: number, changeAvatarDto: ChangeAvatarDto) {
    const { secure_url } = await this.cloudinaryService.uploadImage(
      changeAvatarDto.file,
    );
    await this.userRepository.nativeUpdate(
      { id: meId },
      { avatarUrl: secure_url },
    );

    return { avatarUrl: secure_url };
  }

  async removeAvatar(meId: number) {
    await this.userRepository.nativeUpdate({ id: meId }, { avatarUrl: null });

    return true;
  }

  async devUnsafeDeleteAccount(userId: number) {
    const deletedRow = await this.userRepository.nativeDelete(userId);
    return !!deletedRow;
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findOne(id: number) {
    return this.userRepository.findOne(id);
  }
}
