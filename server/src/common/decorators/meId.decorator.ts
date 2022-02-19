import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';

export const MeId = createParamDecorator(
  (options: { isOptional?: boolean }, ctx: ExecutionContext): number | null => {
    const req = ctx.switchToHttp().getRequest();

    const token = req.headers?.authorization
      ? (req.headers.authorization as string).split(' ')
      : null;

    console.log('token', token);

    try {
      if (token?.[1]) {
        const decoded: any = verify(token[1], process.env.ACCESS_TOKEN_SECRET);
        console.log('decoded ', decoded);
        return decoded?.['userId'];
      }
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
