import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/pathContents/utils'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import {
  PathContentsRequestSchema,
  queryForCommitFile as query,
} from '../../constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UsePrefetchPullFileEntry {
  ref: string
  path: string
  options?: {
    suspense?: boolean
  }
}

export function usePrefetchPullFileEntry({
  ref,
  path,
  options = {},
}: UsePrefetchPullFileEntry) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery({
      queryKey: ['commit', provider, owner, repo, ref, path, query],
      queryFn: ({ signal }) =>
        Api.graphql({
          provider,
          query,
          signal,
          variables: {
            owner,
            repo,
            ref,
            path,
          },
        }).then((res) => {
          const parsedRes = PathContentsRequestSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return rejectNetworkError({
              errorName: 'Parsing Error',
              errorDetails: {
                callingFn: 'usePrefetchPullFileEntry',
                error: parsedRes.error,
              },
            })
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return rejectNetworkError({
              errorName: 'Not Found Error',
              errorDetails: { callingFn: 'usePrefetchPullFileEntry' },
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return rejectNetworkError({
              errorName: 'Owner Not Activated',
              errorDetails: { callingFn: 'usePrefetchPullFileEntry' },
              data: {
                detail: (
                  <p>
                    Activation is required to view this repo, please{' '}
                    {/* @ts-expect-error - A hasn't been typed yet */}
                    <A to={{ pageName: 'membersTab' }}>click here </A> to
                    activate your account.
                  </p>
                ),
              },
            })
          }

          const coverage = extractCoverageFromResponse(data?.owner?.repository)

          if (!coverage) {
            return null
          }

          return coverage
        }),
      staleTime: 10000,
      ...options,
    })

  return { runPrefetch }
}
