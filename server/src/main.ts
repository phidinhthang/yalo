import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AsyncApiDocumentBuilder,
  AsyncApiModule,
  AsyncServerObject,
} from 'nestjs-asyncapi';
import { patchNestjsSwagger } from '@abitia/zod-dto';
import { AppModule } from './app.module';
import { config } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const asyncApiServer: AsyncServerObject = {
    url: 'ws://localhost:4000',
    protocol: 'socket.io',
    protocolVersion: '4',
  };

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Zalo web socket.io')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('socket.io-server', asyncApiServer)
    .build();

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Zalo web api')
    .setDescription('Zalo Web Api')
    .setVersion('v1')
    .addBearerAuth()
    .build();

  if (config.isProduction) {
    const asyncapiDocument = AsyncApiModule.createDocument(
      app,
      asyncApiOptions,
    );
    await AsyncApiModule.setup('/async-api', app, asyncapiDocument);
  }

  patchNestjsSwagger();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('docs', app, document);

  await app.listen(4000);
}
bootstrap();
