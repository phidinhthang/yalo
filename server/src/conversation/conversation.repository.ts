import { EntityData, FilterQuery, FindOneOptions, wrap } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Conversation } from './conversation.entity';

export class ConversationRepository extends EntityRepository<Conversation> {
  async upsert(
    where: FilterQuery<Conversation>,
    data: EntityData<Conversation>,
    options?: FindOneOptions<Conversation, never>,
  ) {
    let e = await this.findOne(where, options);
    if (e) {
      wrap(e).assign(data);
    } else {
      e = this.create(data);
      await this.persistAndFlush(e);
    }
    return e;
  }
}
