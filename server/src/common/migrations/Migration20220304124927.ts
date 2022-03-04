import { Migration } from '@mikro-orm/migrations';

export class Migration20220304124927 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" add column "is_deleted" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop column "is_deleted";');
  }

}
