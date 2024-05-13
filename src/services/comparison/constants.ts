// Comparisons are intended to remain constant between comparisons between commit and parent, and head and base of a PR, hence the Fragment
export const ComparisonFragment = `
fragment ComparisonFragment on Comparison {
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
      segments (filters: $filters) {
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
}
`
