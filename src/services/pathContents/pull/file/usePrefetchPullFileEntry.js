import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/file/utils'
import Api from 'shared/api'

import { queryForCommitFile as query } from '../../constants'

export function usePrefetchPullFileEntry({ ref, path, options = {} }) {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery({
      queryKey: [
        'commit',
        provider,
        owner,
        repo,
        ref,
        path,
        query,
        extractCoverageFromResponse,
      ],
      queryFn: () =>
        Api.graphql({
          provider,
          query,
          variables: {
            provider,
            owner,
            repo,
            ref,
            path,
          },
        }).then(extractCoverageFromResponse),
      staleTime: 10000,
      ...options,
    })

  return { runPrefetch }
}
