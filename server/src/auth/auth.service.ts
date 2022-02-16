import { Injectable } from '@nestjs/common';
import { SignOptions, VerifyOptions, sign, verify, Secret } from 'jsonwebtoken';
import { User } from 'src/users/users.entity';

@Injectable()
export class AuthService {
  constructor() {}

  private sign(
    payload: string | Object | Buffer,
    secretKey: string,
    options?: SignOptions,
  ) {
    return sign(payload, secretKey, options);
  }

  signAccessToken(user: User) {
    console.log('ats', process.env.ACCESS_TOKEN_SECRET);
    return this.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
  }

  signRefreshToken(user: User) {
    return this.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
  }

  verify(token: string, secretKey: Secret, options?: VerifyOptions) {
    return verify(token, secretKey, options);
  }
}
