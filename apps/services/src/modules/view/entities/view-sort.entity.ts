import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { SortDirection } from '@panels/types/views'
import { View } from './view.entity.js'

@Entity()
export class ViewSort {
  @PrimaryKey()
  id!: number

  @Property()
  columnName!: string

  @Enum({ items: () => SortDirection })
  direction!: SortDirection

  @Property()
  order!: number // for multi-column sorting

  @ManyToOne(() => View)
  view!: View
}
