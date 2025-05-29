import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Worklist } from './worklist.entity.js';

export const ColumnType = {
  STRING: 'string',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
  TASKS: 'tasks',
  SELECT: 'select',
  ARRAY: 'array',
  CUSTOM: 'custom'
} as const;

export type ColumnType = typeof ColumnType[keyof typeof ColumnType];

export interface ColumnProperties {
  required?: boolean;
  unique?: boolean;
  description?: string;
  source?: string;
  options?: { value: string; color: string }[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  display?: {
    width?: number;
    format?: string;
    visible?: boolean;
  };
}

@Entity()
export class WorklistColumn {
  @PrimaryKey()
  id!: number;

  @Property()
  key!: string;

  @Property()
  name!: string;

  @Enum({ items: () => ColumnType })
  type!: ColumnType;

  @Property()
  order!: number;

  @Property({ type: 'jsonb' })
  properties!: ColumnProperties;

  @Property({ type: 'jsonb', nullable: true })
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  metadata?: Record<string, any>;

  @ManyToOne(() => Worklist, { deleteRule: 'CASCADE' })
  worklist!: Worklist;
} 