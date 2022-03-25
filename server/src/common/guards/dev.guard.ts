import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DevGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return true;
  }
}
