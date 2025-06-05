import type { CohortLogic, CohortOperator } from '@panels/types/panels'

export interface CohortCondition {
  field: string
  operator: (typeof CohortOperator)[keyof typeof CohortOperator]
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value: any
}

export interface CohortRule {
  conditions: CohortCondition[]
  logic: CohortLogic
}
