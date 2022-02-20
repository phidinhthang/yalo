import { Migration } from '@mikro-orm/migrations';

export class Migration20220220064701 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "users" ("id" serial primary key, "username" varchar(255) not null, "is_online" boolean not null default false, "password" varchar(255) not null);');

    this.addSql('create table "conversations" ("id" serial primary key, "title" varchar(255) null, "type" text check ("type" in (\'private\', \'group\')) not null, "admin_id" int null, "last_message_id" int null, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');
    this.addSql('alter table "conversations" add constraint "conversations_last_message_id_unique" unique ("last_message_id");');

    this.addSql('create table "members" ("conversation_id" int not null, "user_id" int not null, "last_read_at" timestamptz(0) null, "joined_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');
    this.addSql('alter table "members" add constraint "members_pkey" primary key ("conversation_id", "user_id");');

    this.addSql('create table "messages" ("id" serial primary key, "creator_id" int not null, "conversation_id" int not null, "text" varchar(255) not null, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');

    this.addSql('alter table "conversations" add constraint "conversations_admin_id_foreign" foreign key ("admin_id") references "users" ("id") on update cascade on delete set null;');
    this.addSql('alter table "conversations" add constraint "conversations_last_message_id_foreign" foreign key ("last_message_id") references "messages" ("id") on update cascade on delete set null;');

    this.addSql('alter table "members" add constraint "members_conversation_id_foreign" foreign key ("conversation_id") references "conversations" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "members" add constraint "members_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "messages" add constraint "messages_creator_id_foreign" foreign key ("creator_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "messages" add constraint "messages_conversation_id_foreign" foreign key ("conversation_id") references "conversations" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "conversations" drop constraint "conversations_admin_id_foreign";');

    this.addSql('alter table "members" drop constraint "members_user_id_foreign";');

    this.addSql('alter table "messages" drop constraint "messages_creator_id_foreign";');

    this.addSql('alter table "members" drop constraint "members_conversation_id_foreign";');

    this.addSql('alter table "messages" drop constraint "messages_conversation_id_foreign";');

    this.addSql('alter table "conversations" drop constraint "conversations_last_message_id_foreign";');

    this.addSql('drop table if exists "users" cascade;');

    this.addSql('drop table if exists "conversations" cascade;');

    this.addSql('drop table if exists "members" cascade;');

    this.addSql('drop table if exists "messages" cascade;');
  }

}
