import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useSingularImpactedFileComparison({
  provider,
  owner,
  repo,
  pullId,
  path,
}) {
  const query = `
    query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          pull(id: $pullId) {
            compareWithBase: compareWithBaseTemp {
              impactedFile(path:$path) {
                headName
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
                segments {
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
    `

  const fetchSingularImpactedFile = ({ signal }) => {
    return Api.graphql({
      provider,
      query,
      signal,
      variables: {
        provider,
        owner,
        repo,
        pullId: parseInt(pullId, 10),
        path,
      },
    })
  }

  function setFileLabel({ isNewFile, isRenamedFile, isDeletedFile }) {
    if (isNewFile) return 'New'
    if (isRenamedFile) return 'Renamed'
    if (isDeletedFile) return 'Deleted'
    return null
  }

  function transformImpactedFileData(impactedFile) {
    const fileLabel = setFileLabel({
      isNewFile: impactedFile?.isNewFile,
      isRenamedFile: impactedFile?.isRenamedFile,
      isDeletedFile: impactedFile?.isDeletedFile,
    })

    return {
      fileLabel,
      headName: impactedFile?.headName,
      isCriticalFile: impactedFile?.isCriticalFile,
      segments: impactedFile?.segments,
    }
  }

  return useQuery(
    ['ImpactedFileComparison', provider, owner, repo, pullId, path],
    ({ signal }) => fetchSingularImpactedFile({ signal }),
    {
      select: ({ data }) =>
        transformImpactedFileData(
          data?.owner?.repository?.pull?.compareWithBase?.impactedFile
        ),
    }
  )
}
