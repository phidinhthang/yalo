import { Migration } from '@mikro-orm/migrations';

export class Migration20220411150608 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" add column "reply_to_id" int null;');
    this.addSql('alter table "messages" add constraint "messages_reply_to_id_foreign" foreign key ("reply_to_id") references "messages" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop constraint "messages_reply_to_id_foreign";');

    this.addSql('alter table "messages" drop column "reply_to_id";');
  }

}
