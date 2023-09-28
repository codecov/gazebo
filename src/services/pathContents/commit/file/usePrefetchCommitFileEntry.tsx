import { type QueryOptions, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { extractCoverageFromResponse } from 'services/file/utils'
import Api from 'shared/api'
import A from 'ui/A'

import { queryForCommitFile as query, RequestSchema } from '../../constants'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UsePrefetchCommitFileEntryArgs {
  commitSha: string
  path: string
  flags?: Array<string>
  options?: QueryOptions
}

export function usePrefetchCommitFileEntry({
  commitSha,
  path,
  flags = [],
  options = {},
}: UsePrefetchCommitFileEntryArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['commit', provider, owner, repo, commitSha, path, flags],
      queryFn: ({ signal }) => {
        return Api.graphql({
          provider,
          query,
          signal,
          variables: {
            provider,
            owner,
            repo,
            ref: commitSha,
            path,
            flags,
          },
        }).then((res) => {
          const parsedRes = RequestSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return Promise.reject({
              status: 404,
              data: null,
            })
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return Promise.reject({
              status: 404,
              data: {},
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return Promise.reject({
              status: 403,
              data: {
                detail: (
                  <p>
                    Activation is required to view this repo, please{' '}
                    {/* @ts-expect-error */}
                    <A to={{ pageName: 'membersTab' }}>click here </A> to
                    activate your account.
                  </p>
                ),
              },
            })
          }

          const extractedResults = extractCoverageFromResponse({ data })

          return extractedResults
        })
      },
      staleTime: 10000,
      ...(!!options && options),
    })
  }

  return { runPrefetch }
}
