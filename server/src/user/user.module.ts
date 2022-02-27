import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MikroOrmModule.forFeature({ entities: [User] }),
    AuthModule,
    SocketModule,
  ],
})
export class UsersModule {}
