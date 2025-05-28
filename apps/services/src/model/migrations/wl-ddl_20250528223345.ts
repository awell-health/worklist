import { Migration } from '@mikro-orm/migrations';

export class Migration20250528223345 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "worklist" ("id" serial primary key, "name" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "worklist_column" ("id" serial primary key, "name" varchar(255) not null, "type" text check ("type" in ('text', 'number', 'date', 'boolean', 'select', 'multi_select', 'user', 'file', 'custom')) not null, "order" int not null, "properties" jsonb not null, "metadata" jsonb null, "worklist_id" int not null);`);

    this.addSql(`alter table "worklist_column" add constraint "worklist_column_worklist_id_foreign" foreign key ("worklist_id") references "worklist" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "worklist_column" drop constraint "worklist_column_worklist_id_foreign";`);

    this.addSql(`drop table if exists "worklist" cascade;`);

    this.addSql(`drop table if exists "worklist_column" cascade;`);
  }

}
