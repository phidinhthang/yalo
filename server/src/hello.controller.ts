import { Get, HttpCode } from '@nestjs/common';
import { Controller } from '@nestjs/common';

@Controller('hello')
export class HelloController {
  @Get('/')
  @HttpCode(200)
  hello() {
    return {
      hello: 'world',
    };
  }
}
