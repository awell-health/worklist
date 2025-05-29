import { Migration } from '@mikro-orm/migrations';

export class Migration20250529094042 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "worklist_column" drop constraint if exists "worklist_column_type_check";`);

    this.addSql(`alter table "worklist" add column "tenant_id" varchar(255) not null, add column "user_id" varchar(255) null;`);
    this.addSql(`create index "worklist_tenant_id_user_id_index" on "worklist" ("tenant_id", "user_id");`);

    this.addSql(`alter table "worklist_column" add column "key" varchar(255) not null;`);
    this.addSql(`alter table "worklist_column" add constraint "worklist_column_type_check" check("type" in ('string', 'number', 'date', 'boolean', 'tasks', 'select', 'array', 'custom'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "worklist_column" drop constraint if exists "worklist_column_type_check";`);

    this.addSql(`drop index "worklist_tenant_id_user_id_index";`);
    this.addSql(`alter table "worklist" drop column "tenant_id", drop column "user_id";`);

    this.addSql(`alter table "worklist_column" drop column "key";`);

    this.addSql(`alter table "worklist_column" add constraint "worklist_column_type_check" check("type" in ('text', 'number', 'date', 'boolean', 'select', 'multi_select', 'user', 'file', 'custom'));`);
  }

}
