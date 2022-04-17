import { verify } from 'jsonwebtoken';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient();
    const token: string = client.handshake.query.token;
    if (!token) return false;
    try {
      const decoded: any = verify(token, process.env.ACCESS_TOKEN_SECRET);
      return !!decoded.userId;
    } catch (err) {
      return false;
    }
  }
}
