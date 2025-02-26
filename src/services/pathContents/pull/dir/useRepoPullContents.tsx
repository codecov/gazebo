import { useQuery } from '@tanstack/react-query'
import parseInt from 'lodash/parseInt'
import { z } from 'zod'

import { PathContentsFilters } from 'services/pathContents/constants'
import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { query, RepositorySchema } from './constants'

const RequestSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

interface UseRepoPullContentsArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
  path: string
  filters?: PathContentsFilters
  opts?: {
    suspense?: boolean
  }
}

export function useRepoPullContents({
  provider,
  owner,
  repo,
  pullId,
  path,
  filters,
  opts = {},
}: UseRepoPullContentsArgs) {
  return useQuery({
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
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useRepoPullContents',
              error: parsedRes.error,
            },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'useRepoPullContents' },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn: 'useRepoPullContents' },
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        let results
        const pathContentsType =
          data?.owner?.repository?.pull?.head?.pathContents?.__typename
        if (pathContentsType === 'PathContents') {
          results = data?.owner?.repository?.pull?.head?.pathContents?.results
        }

        return {
          results: results ?? null,
          commitid: data?.owner?.repository?.pull?.head?.commitid,
          indicationRange:
            data?.owner?.repository?.repositoryConfig?.indicationRange,
          pathContentsType,
        }
      }),
    ...opts,
  })
}
