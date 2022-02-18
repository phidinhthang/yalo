import { UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AsyncApiPub, AsyncApiService, AsyncApiSub } from 'nestjs-asyncapi';
import { Server, Socket } from 'socket.io';
import { Client } from '../common/decorators/client.decorator';
import { WsAuthGuard } from 'src/common/guards/wsAuth.guard';
import { MeId } from 'src/common/guards/wsMeId.decorator';
import { SocketService } from './socket.service';

class Noop {
  @ApiProperty()
  noop: string;
}

@AsyncApiService()
@WebSocketGateway({
  namespace: '/ws',
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private socketService: SocketService) {}

  afterInit(server: Server) {
    this.socketService.socket = server;
  }

  async handleConnection(socket: Socket) {}

  async handleDisconnect(socket: Socket) {}

  @AsyncApiSub({
    channel: 'toggle_online',
    message: {
      name: 'toggle_online',
      payload: {
        type: class {},
      },
    },
  })
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('toggle_online')
  @AsyncApiPub({
    channel: 'toggle_online',
    message: {
      name: 'toggle_online',
      payload: { type: Noop },
    },
  })
  toggleOnline(@MeId() userId: number) {
    console.log('toggle online userId ', userId);
    this.socketService.toggleOnlineStatus(userId);
  }

  @AsyncApiSub({
    channel: 'toggle_offline',
    message: {
      name: 'toggle_offline',
      payload: {
        type: class {},
      },
    },
  })
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('toggle_offline')
  @AsyncApiPub({
    channel: 'toggle_offline',
    message: {
      name: 'toggle_offline',
      payload: { type: Noop },
    },
  })
  toggleOffline(@MeId() userId: number) {
    console.log('toggle offline userId ', userId);
    this.socketService.toggleOfflineStatus(userId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join_user')
  @AsyncApiPub({
    channel: 'join_user',
    message: {
      name: 'join_user',
      payload: { type: Noop },
    },
  })
  joinUser(@Client() client: Socket, @MeId() userId: number) {
    console.log('join user id ', userId);
    client.join(`${userId}`);
  }
}
