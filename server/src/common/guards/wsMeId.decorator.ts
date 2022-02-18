import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';

export const MeId = createParamDecorator(
  (options: { isOptional?: boolean }, ctx: ExecutionContext): number | null => {
    const client = ctx.switchToWs().getClient();
    const token = client.handshake.query.token;
    console.log('token', token);

    if (!token) return undefined;

    try {
      const decoded: any = verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('decoded ', decoded);
      return decoded?.['userId'];
    } catch (error) {
      if (options.isOptional) {
        return undefined;
      }
      throw new HttpException(
        { message: 'not authenticalted' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  },
);
