import { Migration } from '@mikro-orm/migrations';

export class Migration20220322034820 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "comments" ("id" serial primary key, "creator_id" int not null, "post_id" int not null, "text" varchar(255) not null, "created_at" timestamptz(0) not null default CURRENT_TIMESTAMP);');

    this.addSql('alter table "comments" add constraint "comments_creator_id_foreign" foreign key ("creator_id") references "users" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "comments" add constraint "comments_post_id_foreign" foreign key ("post_id") references "posts" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "comments" cascade;');
  }

}
