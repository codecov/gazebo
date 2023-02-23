import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

import { query } from './constants'

export function usePrefetchCommitDirEntry({
  commit,
  path,
  filters,
  opts = {},
}) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    // TODO: Object notation
    await queryClient.prefetchQuery({
      queryKey: [
        'CommitPathContents',
        provider,
        owner,
        repo,
        commit,
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
            name: owner,
            repo,
            commit,
            path,
            filters,
          },
        }).then((res) => ({
          results: res?.data?.owner?.repository?.commit?.pathContents?.results,
          indicationRange:
            res?.data?.owner?.repository?.repositoryConfig?.indicationRange,
        })),
      staleTime: 10000,
      ...opts,
    })

  return { runPrefetch }
}
