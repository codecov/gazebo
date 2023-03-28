import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

// Get rid of this
function setFileLabel({ isNewFile, isRenamedFile, isDeletedFile }) {
  if (isNewFile) return 'New'
  if (isRenamedFile) return 'Renamed'
  if (isDeletedFile) return 'Deleted'
  return null
}

// Put this in common util function or rather in select of another hook
function transformImpactedFileData(impactedFile) {
  const fileLabel = setFileLabel({
    isNewFile: impactedFile?.isNewFile,
    isRenamedFile: impactedFile?.isRenamedFile,
    isDeletedFile: impactedFile?.isDeletedFile,
  })
  const hashedPath = impactedFile?.hashedPath

  return {
    fileLabel,
    headName: impactedFile?.headName,
    isCriticalFile: impactedFile?.isCriticalFile,
    segments: impactedFile?.segmentsDeprecated,
    ...(hashedPath && { hashedPath }),
  }
}

const query = `
    query ImpactedFileComparedWithParent($owner: String!, $repo: String!, $commitid: String!, $path: String!, $filters: SegmentsFilters) {
      owner(username: $owner) {
        repository(name: $repo) {
          commit(id: $commitid) {
            compareWithParent {
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
                  segmentsDeprecated (filters: $filters) {
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
        }
      }
    }
`

export function useComparisonForCommitAndParent({
  provider,
  owner,
  repo,
  commitid,
  path,
  filters = {},
}) {
  return useQuery({
    queryKey: [
      'ImpactedFileComparedWithParent',
      provider,
      owner,
      repo,
      commitid,
      path,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          commitid,
          path,
          filters,
        },
      }).then((res) =>
        transformImpactedFileData(
          res?.data?.owner?.repository?.commit?.compareWithParent?.impactedFile
        )
      ),
    suspense: false,
  })
}
