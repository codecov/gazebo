import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { PathContentsFilters } from 'services/pathContents/constants'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { query, RequestSchema } from './constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UsePrefetchCommitDirEntryArgs {
  commit: string
  path: string
  filters?: PathContentsFilters
  opts?: {
    suspense?: boolean
  }
}

export function usePrefetchCommitDirEntry({
  commit,
  path,
  filters,
  opts = {},
}: UsePrefetchCommitDirEntryArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
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
        }).then((res) => {
          const parsedRes = RequestSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return rejectNetworkError({
              errorName: 'Parsing Error',
              errorDetails: {
                callingFn: 'usePrefetchCommitDirEntry',
                error: parsedRes.error,
              },
            })
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return rejectNetworkError({
              errorName: 'Not Found Error',
              errorDetails: {
                callingFn: 'usePrefetchCommitDirEntry',
              },
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return rejectNetworkError({
              errorName: 'Owner Not Activated',
              errorDetails: {
                callingFn: 'usePrefetchCommitDirEntry',
              },
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

          let results

          if (
            data?.owner?.repository?.commit?.pathContents?.__typename ===
            'PathContents'
          ) {
            results = data?.owner?.repository?.commit?.pathContents?.results
          }
          return {
            results: results ?? null,
            indicationRange:
              data?.owner?.repository?.repositoryConfig?.indicationRange,
          }
        }),
      staleTime: 10000,
      ...opts,
    })

  return { runPrefetch }
}
