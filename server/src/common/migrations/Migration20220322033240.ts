import { Migration } from '@mikro-orm/migrations';

export class Migration20220322033240 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "posts" add column "num_comments" int not null default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "posts" drop column "num_comments";');
  }

}
