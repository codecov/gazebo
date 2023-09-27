import { CommitErrorTypes } from 'shared/utils/commit'

export const ComparisonReturnType = Object.freeze({
  SUCCESSFUL_COMPARISON: 'Comparison',
  MISSING_COMPARISON: 'MissingComparison',
  FIRST_PULL_REQUEST: 'FirstPullRequest',
  ...CommitErrorTypes,
})
