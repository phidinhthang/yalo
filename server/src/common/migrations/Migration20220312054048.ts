import { Migration } from '@mikro-orm/migrations';

export class Migration20220312054048 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" add column "images" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop column "images";');
  }

}
