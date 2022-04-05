import { Migration } from '@mikro-orm/migrations';

export class Migration20220404151336 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "notifications" drop constraint "notifications_notifcation_object_id_foreign";');

    this.addSql('alter table "notifications" drop constraint if exists "notifications_status_check";');
    this.addSql('alter table "notifications" alter column "status" type int using ("status"::int);');
    this.addSql('alter table "notifications" alter column "status" set default 0;');
    this.addSql('alter table "notifications" rename column "notifcation_object_id" to "notification_object_id";');
    this.addSql('alter table "notifications" add constraint "notifications_notification_object_id_foreign" foreign key ("notification_object_id") references "notification_objects" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "notifications" drop constraint "notifications_notification_object_id_foreign";');

    this.addSql('alter table "notifications" drop constraint if exists "notifications_status_check";');
    this.addSql('alter table "notifications" alter column "status" drop default;');
    this.addSql('alter table "notifications" alter column "status" type int using ("status"::int);');
    this.addSql('alter table "notifications" rename column "notification_object_id" to "notifcation_object_id";');
    this.addSql('alter table "notifications" add constraint "notifications_notifcation_object_id_foreign" foreign key ("notifcation_object_id") references "notification_objects" ("id") on update cascade on delete cascade;');
  }

}
