import { Migration } from '@mikro-orm/migrations';

export class Migration20220404145142 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "notification_entity_types" ("id" serial primary key, "entity" varchar(255) not null, "description" varchar(255) not null);');

    this.addSql('create table "notification_objects" ("id" serial primary key, "entity_type_id" int not null, "entity_id" int null, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');

    this.addSql('create table "notifications" ("id" serial primary key, "notifcation_object_id" int not null, "notifier_id" int not null, "status" int not null);');

    this.addSql('create table "notification_changes" ("id" serial primary key, "notification_object_id" int not null, "actor_id" int not null);');

    this.addSql('alter table "notification_objects" add constraint "notification_objects_entity_type_id_foreign" foreign key ("entity_type_id") references "notification_entity_types" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "notifications" add constraint "notifications_notifcation_object_id_foreign" foreign key ("notifcation_object_id") references "notification_objects" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "notifications" add constraint "notifications_notifier_id_foreign" foreign key ("notifier_id") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "notification_changes" add constraint "notification_changes_notification_object_id_foreign" foreign key ("notification_object_id") references "notification_objects" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "notification_changes" add constraint "notification_changes_actor_id_foreign" foreign key ("actor_id") references "users" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "notification_objects" drop constraint "notification_objects_entity_type_id_foreign";');

    this.addSql('alter table "notifications" drop constraint "notifications_notifcation_object_id_foreign";');

    this.addSql('alter table "notification_changes" drop constraint "notification_changes_notification_object_id_foreign";');

    this.addSql('drop table if exists "notification_entity_types" cascade;');

    this.addSql('drop table if exists "notification_objects" cascade;');

    this.addSql('drop table if exists "notifications" cascade;');

    this.addSql('drop table if exists "notification_changes" cascade;');
  }

}
