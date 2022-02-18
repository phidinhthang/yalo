import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const Client = createParamDecorator(
  (_, ctx: ExecutionContext): Socket => {
    const client = ctx.switchToWs().getClient();
    return client;
  },
);
