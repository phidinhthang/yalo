import { Migration } from '@mikro-orm/migrations';

export class Migration20220410094834 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" add column "files" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop column "files";');
  }

}
