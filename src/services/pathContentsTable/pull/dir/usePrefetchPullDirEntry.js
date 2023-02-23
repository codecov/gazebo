import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

import { query } from './constants'

export function usePrefetchPullDirEntry({ pullId, path, filters, opts = {} }) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () => {
    await queryClient.prefetchQuery({
      queryKey: [
        'PullPathContents',
        provider,
        owner,
        repo,
        pullId,
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
            owner,
            repo,
            pullId: parseInt(pullId, 10),
            path,
            filters,
          },
        }).then((res) => {
          return res?.data?.owner?.repository?.pull?.head?.pathContents
        }),
      staleTime: 10000,
      ...opts,
    })
  }

  return { runPrefetch }
}
