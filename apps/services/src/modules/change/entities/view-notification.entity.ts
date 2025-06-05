import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import {
  NotificationImpact,
  NotificationStatus,
} from '@panels/types/view-notifications'
import { View } from '../../view/entities/view.entity.js'
import { PanelChange } from './panel-change.entity.js'

@Entity()
@Index({ properties: ['userId', 'status'] })
export class ViewNotification {
  @PrimaryKey()
  id!: number

  @Property()
  userId!: string

  @Enum({ items: () => NotificationStatus })
  status!: NotificationStatus

  @Enum({ items: () => NotificationImpact })
  impact!: NotificationImpact

  @Property()
  message!: string

  @Property({ nullable: true })
  acknowledgedAt?: Date

  @ManyToOne(() => View)
  view!: View

  @ManyToOne(() => PanelChange)
  panelChange?: PanelChange

  @Property()
  createdAt: Date = new Date()
}
