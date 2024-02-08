import { CommitErrorTypes } from 'shared/utils/commit'

export type TComparisonReturnType =
  (typeof ComparisonReturnType)[keyof typeof ComparisonReturnType]

export const ComparisonReturnType = {
  SUCCESSFUL_COMPARISON: 'Comparison',
  MISSING_COMPARISON: 'MissingComparison',
  FIRST_PULL_REQUEST: 'FirstPullRequest',
  ...CommitErrorTypes,
} as const
