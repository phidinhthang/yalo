import { Migration } from '@mikro-orm/migrations';

export class Migration20220226045147 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "users" add column "last_login_at" timestamptz(0) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" drop column "last_login_at";');
  }

}
