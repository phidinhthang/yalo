import { Migration } from '@mikro-orm/migrations';

export class Migration20220402135027 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "messages" add column "num_reactions" jsonb not null default \'{}\';',
    );

    this.addSql(
      'alter table "posts" drop constraint if exists "posts_num_reactions_check";',
    );
    this.addSql(
      'alter table "posts" alter column "num_reactions" drop default;',
    );
    this.addSql('alter table "posts" drop column "num_reactions";');
    this.addSql(
      'alter table "posts" add column "num_reactions" jsonb not null default \'{}\';',
    );

    this.addSql(
      "alter table \"reactions\" add column \"value\" text check (\"value\" in ('like', 'love', 'haha', 'wow', 'sad', 'angry')) not null, add column \"type\" text check (\"type\" in ('m', 'p')) not null, add column \"message_id\" int null;",
    );
    this.addSql(
      'alter table "reactions" drop constraint if exists "reactions_post_id_check";',
    );
    this.addSql(
      'alter table "reactions" alter column "post_id" type int using ("post_id"::int);',
    );
    this.addSql(
      'alter table "reactions" alter column "post_id" drop not null;',
    );
    this.addSql('drop index "reactions_user_id_post_id_index";');
    this.addSql(
      'alter table "reactions" add constraint "reactions_message_id_foreign" foreign key ("message_id") references "messages" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "reactions" drop constraint "reactions_message_id_foreign";',
    );

    this.addSql('alter table "messages" drop column "num_reactions";');

    this.addSql(
      'alter table "posts" drop constraint if exists "posts_num_reactions_check";',
    );
    this.addSql('alter table "posts" drop column "num_reactions";');
    this.addSql(
      'alter table "posts" add column "num_reactions" int not null default 0;',
    );

    this.addSql(
      'alter table "reactions" drop constraint if exists "reactions_post_id_check";',
    );
    this.addSql(
      'alter table "reactions" alter column "post_id" type int using ("post_id"::int);',
    );
    this.addSql('alter table "reactions" alter column "post_id" set not null;');
    this.addSql('alter table "reactions" drop column "value";');
    this.addSql('alter table "reactions" drop column "type";');
    this.addSql('alter table "reactions" drop column "message_id";');
    this.addSql(
      'create index "reactions_user_id_post_id_index" on "reactions" ("user_id", "post_id");',
    );
  }
}
