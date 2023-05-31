import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

import { FileComparisonWithBase } from './fragments'
import { transformImpactedFileData } from './utils'

const query = `
  query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!, $filters: SegmentsFilters) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        pull(id: $pullId) {
          ...FileComparisonWithBase
        }
      }
    }
  }
  ${FileComparisonWithBase}
`

export function usePrefetchSingleFileComp({ path, filters = {} }) {
  const { provider, owner, repo, pullId } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['ImpactedFileComparison', provider, owner, repo, pullId, path, filters],
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
            filters,
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
