import {
  Property,
  PrimaryKey,
  Entity,
  EntityRepositoryType,
} from '@mikro-orm/core';
import { UserRepository } from './user.repository';

@Entity({ tableName: 'users', customRepository: () => UserRepository })
export class User {
  [EntityRepositoryType]?: UserRepository;

  @PrimaryKey()
  id: number;

  @Property()
  username: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ default: false, defaultRaw: 'false' })
  isOnline: boolean = false;

  @Property({ hidden: true })
  password: string;
}
