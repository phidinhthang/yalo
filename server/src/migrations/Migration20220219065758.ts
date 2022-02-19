import { Migration } from '@mikro-orm/migrations';

export class Migration20220219065758 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "username" varchar(255) not null, "is_online" boolean not null default false, "password" varchar(255) not null);');
  }

}
