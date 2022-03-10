import { IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 255, { message: 'length' })
  @IsNotEmpty({ message: 'empty' })
  username: string;

  @Length(3, 255, { message: 'length' })
  @IsNotEmpty({ message: 'empty' })
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
