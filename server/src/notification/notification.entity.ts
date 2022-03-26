import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'notifications' })
export class Notification {
  @PrimaryKey()
  id: number;

  @Property()
  type: string;

  @Property({ type: 'jsonb' })
  payload: NewPost | NewFriendRequest;

  @Property()
  isRead: boolean = false;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

type NewPost = {
  creator: {
    id: number;
    avatarUrl: string;
    username: string;
  };
};

type NewFriendRequest = {
  requester: {
    id: number;
    avatarUrl: string;
    username: string;
  };
};
