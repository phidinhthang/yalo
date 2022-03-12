import { Migration } from '@mikro-orm/migrations';

export class Migration20220312113108 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" drop constraint if exists "messages_text_check";');
    this.addSql('alter table "messages" alter column "text" type varchar(255) using ("text"::varchar(255));');
    this.addSql('alter table "messages" alter column "text" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop constraint if exists "messages_text_check";');
    this.addSql('alter table "messages" alter column "text" type varchar using ("text"::varchar);');
    this.addSql('alter table "messages" alter column "text" set not null;');
  }

}
