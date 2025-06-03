import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { View } from './view.entity.js'

export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection]

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
