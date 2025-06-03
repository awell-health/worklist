import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Panel } from '../../panel/entities/panel.entity.js'

export const ChangeType = {
  COLUMN_ADDED: 'column_added',
  COLUMN_REMOVED: 'column_removed',
  COLUMN_MODIFIED: 'column_modified',
  SOURCE_CHANGED: 'source_changed',
  COHORT_CHANGED: 'cohort_changed',
} as const

export type ChangeType = (typeof ChangeType)[keyof typeof ChangeType]

@Entity()
export class PanelChange {
  @PrimaryKey()
  id!: number

  @Enum({ items: () => ChangeType })
  changeType!: ChangeType

  @Property({ nullable: true })
  affectedColumn?: string

  @Property({ type: 'jsonb' })
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  changeDetails!: Record<string, any>

  @ManyToOne(() => Panel)
  panel!: Panel

  @Property()
  createdAt: Date = new Date()
}
