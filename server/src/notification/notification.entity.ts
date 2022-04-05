import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import {
  NotificationChangeRepository,
  NotificationObjectRepository,
  NotificationRepository,
} from './notification.repository';

@Entity({ tableName: 'notification_entity_types' })
export class NotificationEntityType {
  @PrimaryKey()
  id: number;

  @Property()
  entity: string;

  @Property()
  description: string;
}

@Entity({
  tableName: 'notification_objects',
  customRepository: () => NotificationObjectRepository,
})
export class NotificationObject {
  [EntityRepositoryType]?: NotificationObjectRepository;

  @PrimaryKey()
  id: number;

  @ManyToOne(() => NotificationEntityType, { onDelete: 'cascade' })
  entityType: NotificationEntityType;

  @Property({ nullable: true })
  entityId?: number;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}

@Entity({
  tableName: 'notifications',
  customRepository: () => NotificationRepository,
})
export class Notification {
  [EntityRepositoryType]?: NotificationRepository;

  @PrimaryKey()
  id: number;

  @ManyToOne(() => NotificationObject, { onDelete: 'cascade' })
  notificationObject: NotificationObject;

  @ManyToOne(() => User, { onDelete: 'cascade' })
  notifier: User;

  @Property({ default: 0, defaultRaw: '0' })
  status: number = 0;
}

@Entity({
  tableName: 'notification_changes',
  customRepository: () => NotificationChangeRepository,
})
export class NotificationChange {
  [EntityRepositoryType]?: NotificationChangeRepository;

  @PrimaryKey()
  id: number;

  @ManyToOne(() => NotificationObject, { onDelete: 'cascade' })
  notificationObject: NotificationObject;

  @ManyToOne(() => User)
  actor: User;
}
