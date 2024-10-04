import { CommitErrorTypes } from 'shared/utils/commit'

export type TComparisonReturnType =
  (typeof ComparisonReturnType)[keyof typeof ComparisonReturnType]

export const ComparisonReturnType = {
  SUCCESSFUL_COMPARISON: 'Comparison',
  MISSING_COMPARISON: 'MissingComparison',
  FIRST_PULL_REQUEST: 'FirstPullRequest',
  ...CommitErrorTypes,
} as const

export type TReportUploadType =
  (typeof ReportUploadType)[keyof typeof ReportUploadType]

export const ReportUploadType = {
  BUNDLE_ANALYSIS: 'bundle analysis',
  COVERAGE: 'coverage',
} as const
