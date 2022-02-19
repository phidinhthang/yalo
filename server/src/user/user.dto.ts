import { IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 255)
  @IsNotEmpty()
  username: string;

  @Length(3, 255)
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
