import { Migration } from '@mikro-orm/migrations';

export class Migration20220304053608 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" drop constraint "messages_conversation_id_foreign";');

    this.addSql('alter table "messages" add constraint "messages_conversation_id_foreign" foreign key ("conversation_id") references "conversations" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop constraint "messages_conversation_id_foreign";');

    this.addSql('alter table "messages" add constraint "messages_conversation_id_foreign" foreign key ("conversation_id") references "conversations" ("id") on update cascade;');
  }

}
