import { type QueryOptions, useQueryClient } from '@tanstack/react-query'
import { ParsedQs } from 'qs'
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

interface UsePrefetchCommitFileEntryArgs {
  commitSha: string
  path: string
  flags?: Array<string> | Array<ParsedQs>
  components?: Array<string> | Array<ParsedQs>
  options?: QueryOptions
}

export function usePrefetchCommitFileEntry({
  commitSha,
  path,
  flags = [],
  components = [],
  options = {},
}: UsePrefetchCommitFileEntryArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const runPrefetch = async () => {
    await queryClient.prefetchQuery({
      queryKey: [
        'commit',
        provider,
        owner,
        repo,
        commitSha,
        path,
        flags,
        components,
      ],
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
            components,
          },
        }).then((res) => {
          const callingFn = 'usePrefetchCommitFileEntry'
          const parsedRes = PathContentsRequestSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return rejectNetworkError({
              errorName: 'Parsing Error',
              errorDetails: { callingFn, error: parsedRes.error },
            })
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return rejectNetworkError({
              errorName: 'Not Found Error',
              errorDetails: { callingFn },
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return rejectNetworkError({
              errorName: 'Owner Not Activated',
              errorDetails: { callingFn },
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

          return extractCoverageFromResponse(data?.owner?.repository)
        })
      },
      staleTime: 10000,
      ...(!!options && options),
    })
  }

  return { runPrefetch }
}
