import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Member } from './member.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Member] })],
})
export class MemberModule {}
