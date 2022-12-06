import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

import { FileComparisonWithBase } from './fragments'

const query = `
    query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          pull(id: $pullId) {
            ...FileComparisonWithBase
          }
        }
      }
    }

    ${FileComparisonWithBase}
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

export function useSingularImpactedFileComparison({
  provider,
  owner,
  repo,
  pullId,
  path,
}) {
  return useQuery(
    ['ImpactedFileComparison', provider, owner, repo, pullId, path],
    ({ signal }) =>
      Api.graphql({
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
      }).then((res) =>
        transformImpactedFileData(
          res?.data?.owner?.repository?.pull?.compareWithBase?.impactedFile
        )
      ),
    {
      suspense: false,
    }
  )
}
