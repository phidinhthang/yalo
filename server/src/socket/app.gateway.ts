import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client } from '../common/decorators/client.decorator';
import { WsAuthGuard } from 'src/common/guards/wsAuth.guard';
import { MeId } from 'src/common/decorators/wsMeId.decorator';
import { SocketService } from './socket.service';
import { AuthService } from 'src/auth/auth.service';
import { config } from '../common/config';

@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: '*' },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    this.socketService.socket = server;
  }

  @UseGuards(WsAuthGuard)
  async handleConnection(client: Socket) {
    const token: string = client.handshake.query.token as string;
    if (!token) {
      client.disconnect(true);
    }
    try {
      const decoded: any = this.authService.verify(
        token,
        config.accessTokenSecret,
      );
      const userId = decoded.userId;
      console.log('user join ', userId);
      client.join(`${userId}`);
      this.socketService.toggleOnlineStatus(userId);
    } catch (err) {
      console.log('ws connect error ', err);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const token: string = client.handshake.query.token as string;
    try {
      const decoded: any = this.authService.decode(token);
      const userId = decoded.userId;
      console.log('user leave ', userId);
      client.leave(`${userId}`);
      this.socketService.toggleOfflineStatus(userId);
    } catch (err) {
      console.log('ws connect error ', err);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing')
  typingMessage(@MeId() userId: number, @MessageBody() conversationId: number) {
    return this.socketService.typingMessage(userId, conversationId);
  }
}
