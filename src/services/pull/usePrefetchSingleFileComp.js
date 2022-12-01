import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

const query = `
  query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        pull(id: $pullId) {
          compareWithBase: compareWithBaseTemp {
            impactedFile(path: $path) {
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

export function usePrefetchSingleFileComp({ path }) {
  const { provider, owner, repo, pullId } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['ImpactedFileComparison', provider, owner, repo, pullId, path],
      ({ signal }) =>
        Api.graphql({
          provider,
          repo,
          query,
          signal,
          variables: {
            provider,
            owner,
            repo,
            pullId: parseInt(pullId, 10),
            path,
          },
        }).then((res) =>
          transformImpactedFileData(
            res?.data?.owner?.repository?.pull?.compareWithBase?.impactedFile
          )
        ),
      {
        staleTime: 10000,
      }
    )

  return { runPrefetch }
}
