import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Member } from './member.entity';
import { MemberService } from './member.service';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [Member] })],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
