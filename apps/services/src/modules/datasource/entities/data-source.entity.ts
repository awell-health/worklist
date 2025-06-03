import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Panel } from '../../panel/entities/panel.entity.js'

export const DataSourceType = {
  DATABASE: 'database',
  API: 'api',
  FILE: 'file',
  CUSTOM: 'custom',
} as const

export type DataSourceType =
  (typeof DataSourceType)[keyof typeof DataSourceType]

@Entity()
export class DataSource {
  @PrimaryKey()
  id!: number

  @Enum({ items: () => DataSourceType })
  type!: DataSourceType

  @Property({ type: 'jsonb' })
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  config!: Record<string, any>

  @Property()
  lastSync!: Date

  @ManyToOne(() => Panel, { deleteRule: 'no action' })
  panel!: Panel
}
