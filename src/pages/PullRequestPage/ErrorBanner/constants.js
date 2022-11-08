import { CommitErrorTypes } from 'shared/utils/commit'

export const ComparisonReturnType = Object.freeze({
  SUCCESFUL_COMPARISON: 'Comparison',
  MISSING_COMPARISON: 'MissingComparison',
  ...CommitErrorTypes,
})
