import { Entity, PrimaryKey, Property, OneToMany, Collection, Index } from '@mikro-orm/core';
import { WorklistColumn } from './worklist-column.entity.js';

@Entity()
@Index({ properties: ['tenantId', 'userId'] })
export class Worklist {
  @PrimaryKey()
  id!: number;

  @Property()
  tenantId!: string;

  @Property()
  userId?: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => WorklistColumn, column => column.worklist)
  columns = new Collection<WorklistColumn>(this);
} 