import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    KnexModule.forRoot({
      config: {
        client: 'pg',
        connection: 'postgres://postgres:456852@localhost:5432/zalo-web',
        pool: {
          min: 2,
          max: 10,
        },
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
