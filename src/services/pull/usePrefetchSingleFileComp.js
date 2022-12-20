import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

import { FileComparisonWithBase } from './fragments'
import { transformImpactedFileData } from './utils'

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
