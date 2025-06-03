export const CohortLogic = {
  AND: 'AND',
  OR: 'OR',
} as const

export type CohortLogic = (typeof CohortLogic)[keyof typeof CohortLogic]

export interface CohortCondition {
  field: string
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'between'
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value: any
}

export interface CohortRule {
  conditions: CohortCondition[]
  logic: CohortLogic
}
