import { Migration } from '@mikro-orm/migrations';

export class Migration20220223094628 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "users" add column "avatar_url" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" drop column "avatar_url";');
  }

}
