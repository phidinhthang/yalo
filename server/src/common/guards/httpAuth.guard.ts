import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import jwt = require('jsonwebtoken');
import { Observable } from 'rxjs';

@Injectable()
export class HttpAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const token = authorization.split(' ')[1];

      const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      return !!decoded;
    } catch (e) {
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
