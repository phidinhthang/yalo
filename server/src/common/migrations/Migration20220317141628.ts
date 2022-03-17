import { Migration } from '@mikro-orm/migrations';

export class Migration20220317141628 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "friend_requests" ("requester_id" int not null, "recipient_id" int not null);');
    this.addSql('alter table "friend_requests" add constraint "friend_requests_pkey" primary key ("requester_id", "recipient_id");');

    this.addSql('create table "user_friends" ("user_id" int not null, "friend_id" int not null);');
    this.addSql('alter table "user_friends" add constraint "user_friends_pkey" primary key ("user_id", "friend_id");');

    this.addSql('alter table "friend_requests" add constraint "friend_requests_requester_id_foreign" foreign key ("requester_id") references "users" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "friend_requests" add constraint "friend_requests_recipient_id_foreign" foreign key ("recipient_id") references "users" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "user_friends" add constraint "user_friends_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_friends" add constraint "user_friends_friend_id_foreign" foreign key ("friend_id") references "users" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "friend_requests" cascade;');

    this.addSql('drop table if exists "user_friends" cascade;');
  }

}
