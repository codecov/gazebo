import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/pathContents/utils'
import Api from 'shared/api'

import { queryForCommitFile as query } from '../../constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function usePrefetchBranchFileEntry({
  branch,
  path,
  flags = [],
  options = {},
}: {
  branch: string
  path: string
  flags?: string[]
  options?: Record<string, unknown>
}) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery({
      queryKey: ['commit', provider, branch, owner, repo, path, query, flags],
      queryFn: () =>
        Api.graphql({
          provider,
          query,
          variables: {
            provider,
            owner,
            repo,
            ref: branch,
            path,
            flags,
          },
        }).then((res) =>
          extractCoverageFromResponse(res.data.owner.repository)
        ),
      staleTime: 10000,
    })

  return { runPrefetch }
}
