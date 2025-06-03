import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { View } from './view.entity.js'

export const FilterOperator = {
  EQ: 'eq',
  GT: 'gt',
  LT: 'lt',
  GTE: 'gte',
  LTE: 'lte',
  CONTAINS: 'contains',
  IN: 'in',
  BETWEEN: 'between',
  NE: 'ne',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  NOT_IN: 'notIn',
  IS_NULL: 'isNull',
  IS_NOT_NULL: 'isNotNull',
} as const

export type FilterOperator =
  (typeof FilterOperator)[keyof typeof FilterOperator]

@Entity()
export class ViewFilter {
  @PrimaryKey()
  id!: number

  @Property()
  columnId!: string

  @Enum({ items: () => FilterOperator })
  operator!: FilterOperator

  @Property({ type: 'jsonb' })
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value!: any

  @ManyToOne(() => View)
  view!: View
}
