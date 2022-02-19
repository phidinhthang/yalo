import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { decode } from 'jsonwebtoken';

export const MeId = createParamDecorator(
  (options: { isOptional?: boolean }, ctx: ExecutionContext): number | null => {
    const req = ctx.switchToHttp().getRequest();

    const token = req.headers?.authorization
      ? (req.headers.authorization as string).split(' ')
      : null;

    console.log('token', token);

    try {
      if (token?.[1]) {
        const decoded: any = decode(token[1]);
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
