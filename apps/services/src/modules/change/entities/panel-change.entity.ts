import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { ChangeType } from '@panels/types/changes'
import { Panel } from '../../panel/entities/panel.entity.js'

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
