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
    totals {
      percentCovered
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
        fileName
        headName
        isCriticalFile
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
        isCriticalFile
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
                coverageInfo {
                  hitCount
                  hitUploadIds
                }
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
