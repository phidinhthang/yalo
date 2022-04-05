import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { SocketService } from 'src/socket/socket.service';
import {
  NotificationChangeRepository,
  NotificationObjectRepository,
  NotificationRepository,
} from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationChangeRepository: NotificationChangeRepository,
    private readonly notificationObjectRepository: NotificationObjectRepository,
    private readonly socketService: SocketService,
    private readonly em: EntityManager,
  ) {}

  async create({
    actorId,
    entityId,
    entityTypeId,
    notifierIds,
  }: {
    actorId: number;
    entityId: number;
    entityTypeId: number;
    notifierIds: number[];
  }) {
    const em = this.em.fork();
    const notificationObject = this.notificationObjectRepository.create({
      entityType: entityTypeId,
      entityId: entityId,
    });

    const notificationChange = this.notificationChangeRepository.create({
      actor: actorId,
      notificationObject: notificationObject,
    });
    em.persistAndFlush([notificationObject, notificationChange]);

    const notifications = notifierIds.map((id) => {
      return this.notificationRepository.create({
        notificationObject: notificationObject,
        notifier: id,
        status: 0,
      });
    });

    em.persistAndFlush(notifications).then(() => {
      notifierIds.forEach((notifierId) => {
        this.socketService.socket.to(`${notifierId}`).emit('new_notification');
      });
    });
  }

  async paginated(meId: number) {
    const notifications = await this.em.getConnection('read').execute(
      `
				select no.id,
				no.entity_type_id as "entityTypeId",
				json_build_object(
					'id', net.id,
					'entity', net.entity,
					'description', net.description
				) as "entityType",
				no.entity_id as "entityId",
        n.status,
				no.created_at as "createdAt",
				jsonb_agg(json_build_object(
					'id', u2.id,
					'username', u2.username,
					'avatarUrl', u2.avatar_url
				)) as actors,
        case
          when net.entity = 'post' and p.text is not null then p.text
          when net.entity = 'comment' and c.text is not null then c.text
        end as "display"
				from notifications as n
				inner join notification_objects as no on n.notification_object_id = no.id and n.notifier_id = ?
				left join notification_changes nc on nc.notification_object_id = no.id
				left join users u2 on nc.actor_id = u2.id
				left join notification_entity_types net on net.id = no.entity_type_id
        left join posts p on p.id = no.entity_id and net.entity = 'post'
        left join comments c on c.id = no.entity_id and net.entity = 'comment'
        group by (no.id, no.entity_type_id, no.entity_id, no.created_at, net.id, net.entity, net.description, p.text, c.text, n.status)
        order by no.created_at desc;
			`,
      [meId],
    );

    console.log('notifications ', notifications);

    return notifications;
  }

  async markAsRead(meId: number) {
    await this.notificationRepository.nativeUpdate(
      { notifier: meId },
      { status: 1 },
    );
  }
}
