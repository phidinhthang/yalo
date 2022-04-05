import { EntityRepository } from '@mikro-orm/postgresql';
import {
  NotificationObject,
  Notification,
  NotificationChange,
} from './notification.entity';

export class NotificationRepository extends EntityRepository<Notification> {}
export class NotificationObjectRepository extends EntityRepository<NotificationObject> {}
export class NotificationChangeRepository extends EntityRepository<NotificationChange> {}
