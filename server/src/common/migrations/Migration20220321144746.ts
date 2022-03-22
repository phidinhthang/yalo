import { Migration } from '@mikro-orm/migrations';

export class Migration20220321144746 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "posts" ("id" serial primary key, "text" varchar(255) not null, "creator_id" int not null, "num_reactions" int not null default 0, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP, "updated_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');

    this.addSql('create table "reactions" ("id" serial primary key, "user_id" int not null, "post_id" int not null, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');

    this.addSql('alter table "posts" add constraint "posts_creator_id_foreign" foreign key ("creator_id") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "reactions" add constraint "reactions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "reactions" add constraint "reactions_post_id_foreign" foreign key ("post_id") references "posts" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "reactions" drop constraint "reactions_post_id_foreign";');

    this.addSql('drop table if exists "posts" cascade;');

    this.addSql('drop table if exists "reactions" cascade;');
  }

}
