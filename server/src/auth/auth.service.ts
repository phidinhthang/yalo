import { Injectable } from '@nestjs/common';
import { SignOptions, VerifyOptions, sign, verify, Secret } from 'jsonwebtoken';
import { User } from 'src/users/users.entity';
import { config } from '../common/config';

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
    console.log('ats', config.accessTokenSecret);
    return this.sign({ userId: user.id }, config.accessTokenSecret, {
      expiresIn: '15m',
    });
  }

  signRefreshToken(user: User) {
    return this.sign({ userId: user.id }, config.refreshTokenSecret, {
      expiresIn: '7d',
    });
  }

  verify(token: string, secretKey: Secret, options?: VerifyOptions) {
    return verify(token, secretKey, options);
  }
}
