import { z } from 'zod'

export const HeaderOnPullFragment = `
fragment HeaderOnPullFragment on Pull {
  pullId
  title
  state
  author {
    username
  }
  head {
    ciPassed
    branchName
  }
  updatestamp
}`

export const SummaryOnPullFragment = `
fragment SummaryOnPullFragment on Pull {
  behindBy
  behindByCommit
  head {
    commitid
    coverageAnalytics {
      totals {
        percentCovered
      }
    }
    uploads {
      totalCount
    }
  }
  comparedTo {
    commitid
    uploads {
      totalCount
    }
  }
  compareWithBase {
    __typename
    ... on Comparison {
      patchTotals {
        percentCovered
      }
      changeCoverage
      hasDifferentNumberOfHeadAndBaseReports
    }
    ... on FirstPullRequest {
      message
    }
    ... on MissingBaseCommit {
      message
    }
    ... on MissingHeadCommit {
      message
    }
    ... on MissingComparison {
      message
    }
    ... on MissingBaseReport {
      message
    }
    ... on MissingHeadReport {
      message
    }
  }
  commits {
    edges {
      node {
        state
        commitid
      }
    }
  }
}`

export const CommitsOnPullFragment = `
fragment CommitsOnPullFragment on Pull {
  commits {
    edges {
      node {
        state
        commitid
        message
        author {
          username
        }
      }
    }
  }
}`

export const FlagComparisonsOnPull = `
fragment FlagComparisonsOnPull on Pull {
  compareWithBase {
    __typename
    ... on Comparison {
      flagComparisons {
        name
        patchTotals {
          percentCovered
        }
        headTotals {
          percentCovered
        }
        baseTotals {
          percentCovered
        }
      }
    }
    ... on FirstPullRequest {
      message
    }
    ... on MissingBaseCommit {
      message
    }
    ... on MissingHeadCommit {
      message
    }
    ... on MissingComparison {
      message
    }
    ... on MissingBaseReport {
      message
    }
    ... on MissingHeadReport {
      message
    }
  }
}`

export const ImpactedFilesOnPull = `
fragment ImpactedFilesOnPull on Pull {
  head {
    state
  }
  pullId
  compareWithBase {
    __typename
    ... on Comparison {
      patchTotals {
        percentCovered
      }
      baseTotals {
        percentCovered
      }
      headTotals {
        percentCovered
      }
      impactedFiles(filters: $filters) {
        __typename
        ... on ImpactedFiles {
          results {
            fileName
            headName
            missesCount
            baseCoverage {
              percentCovered
            }
            headCoverage {
              percentCovered
            }
            patchCoverage {
              percentCovered
            }
            changeCoverage
          }
        }
        ... on UnknownFlags {
          message
        }
      }
    }
    ... on FirstPullRequest {
      message
    }
    ... on MissingBaseCommit {
      message
    }
    ... on MissingHeadCommit {
      message
    }
    ... on MissingComparison {
      message
    }
    ... on MissingBaseReport {
      message
    }
    ... on MissingHeadReport {
      message
    }
  }
}`

export const FileComparisonWithBase = `
fragment FileComparisonWithBase on Pull {
  compareWithBase {
    __typename
    ... on Comparison {
      impactedFile(path: $path) {
        headName
        hashedPath
        isNewFile
        isRenamedFile
        isDeletedFile
        baseCoverage {
          percentCovered
        }
        headCoverage {
          percentCovered
        }
        patchCoverage {
          percentCovered
        }
        changeCoverage
        segments(filters: $filters) {
          __typename
          ... on SegmentComparisons {
            results {
              header
              hasUnintendedChanges
              lines {
                baseNumber
                headNumber
                baseCoverage
                headCoverage
                content
              }
            }
          }
        }
      }
    }
    ... on FirstPullRequest {
      message
    }
    ... on MissingBaseCommit {
      message
    }
    ... on MissingHeadCommit {
      message
    }
    ... on MissingComparison {
      message
    }
    ... on MissingBaseReport {
      message
    }
    ... on MissingHeadReport {
      message
    }
  }
}`

const CoverageLineSchema = z.enum(['H', 'M', 'P'])

const SegmentComparisonsSchema = z.object({
  __typename: z.literal('SegmentComparisons'),
  results: z.array(
    z.object({
      header: z.string(),
      hasUnintendedChanges: z.boolean(),
      lines: z.array(
        z.object({
          baseNumber: z.string().nullable(),
          headNumber: z.string().nullable(),
          baseCoverage: CoverageLineSchema.nullable(),
          headCoverage: CoverageLineSchema.nullable(),
          content: z.string().nullable(),
        })
      ),
    })
  ),
})

const UnknownPathSchema = z.object({
  __typename: z.literal('UnknownPath'),
})

const ProviderErrorSchema = z.object({
  __typename: z.literal('ProviderError'),
})

export const ImpactedFileSchema = z.object({
  headName: z.string().nullable(),
  hashedPath: z.string(),
  isNewFile: z.boolean(),
  isRenamedFile: z.boolean(),
  isDeletedFile: z.boolean(),
  changeCoverage: z.number().nullable(),
  baseCoverage: z
    .object({
      percentCovered: z.number().nullable(),
    })
    .nullable(),
  headCoverage: z
    .object({
      percentCovered: z.number().nullable(),
    })
    .nullable(),
  patchCoverage: z
    .object({
      percentCovered: z.number().nullable(),
    })
    .nullable(),
  segments: z.discriminatedUnion('__typename', [
    SegmentComparisonsSchema,
    UnknownPathSchema,
    ProviderErrorSchema,
  ]),
})

export const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  impactedFile: ImpactedFileSchema.nullable(),
})

export const PullCompareWithBaseFragment = `
fragment PullCompareWithBaseFragment on Pull {
  compareWithBase {
    __typename
    ... on Comparison {
      __typename
      flagComparisons {
        name
        patchTotals {
          percentCovered
        }
        headTotals {
          percentCovered
        }
        baseTotals {
          percentCovered
        }
      }
      state
      patchTotals {
        percentCovered
      }
      baseTotals {
        percentCovered
      }
      headTotals {
        percentCovered
      }
      changeCoverage
      hasDifferentNumberOfHeadAndBaseReports
      impactedFiles(filters: $filters) {
        __typename
        ... on ImpactedFiles {
          results {
            fileName
            headName
            missesCount
            patchCoverage {
              percentCovered
            }
            baseCoverage {
              percentCovered
            }
            headCoverage {
              percentCovered
            }
            changeCoverage
          }
        }
        ... on UnknownFlags {
          message
        }
      }
    }
    ... on FirstPullRequest {
      message
    }
    ... on MissingBaseCommit {
      message
    }
    ... on MissingHeadCommit {
      message
    }
    ... on MissingComparison {
      message
    }
    ... on MissingBaseReport {
      message
    }
    ... on MissingHeadReport {
      message
    }
  }
}
`
