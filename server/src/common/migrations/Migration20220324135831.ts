import { Migration } from '@mikro-orm/migrations';

export class Migration20220324135831 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" drop constraint "messages_creator_id_foreign";');

    this.addSql('alter table "messages" add constraint "messages_creator_id_foreign" foreign key ("creator_id") references "users" ("id") on update cascade on delete cascade;');
    this.addSql('create index "messages_created_at_index" on "messages" ("created_at");');

    this.addSql('create index "comments_post_id_index" on "comments" ("post_id");');
    this.addSql('create index "comments_created_at_index" on "comments" ("created_at");');

    this.addSql('create index "reactions_created_at_index" on "reactions" ("created_at");');
    this.addSql('create index "reactions_user_id_post_id_index" on "reactions" ("user_id", "post_id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop constraint "messages_creator_id_foreign";');

    this.addSql('drop index "messages_created_at_index";');
    this.addSql('alter table "messages" add constraint "messages_creator_id_foreign" foreign key ("creator_id") references "users" ("id") on update cascade;');

    this.addSql('drop index "comments_post_id_index";');
    this.addSql('drop index "comments_created_at_index";');

    this.addSql('drop index "reactions_created_at_index";');
    this.addSql('drop index "reactions_user_id_post_id_index";');
  }

}
