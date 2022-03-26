import { Migration } from '@mikro-orm/migrations';

export class Migration20220326051435 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "conversations" add column "members_preview" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "conversations" drop column "members_preview";');
  }

}
