import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { PathContentsFilters } from 'services/pathContents/constants'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
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

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UsePrefetchPullDirEntryArgs {
  pullId: string
  path: string
  filters?: PathContentsFilters
  opts?: {
    suspense?: boolean
  }
}

export function usePrefetchPullDirEntry({
  pullId,
  path,
  filters,
  opts = {},
}: UsePrefetchPullDirEntryArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
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
          const parsedRes = RequestSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchPullDirEntry - 404 schema parsing failed',
            } satisfies NetworkErrorObject)
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchPullDirEntry - 404 NotFoundError',
            } satisfies NetworkErrorObject)
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
                    {/* @ts-expect-error - A hasn't been typed yet */}
                    <A to={{ pageName: 'membersTab' }}>click here </A> to
                    activate your account.
                  </p>
                ),
              },
              dev: 'usePrefetchPullDirEntry - 403 OwnerNotActivatedError',
            } satisfies NetworkErrorObject)
          }

          return data?.owner?.repository?.pull?.head?.pathContents
        }),
      staleTime: 10000,
      ...opts,
    })
  }

  return { runPrefetch }
}
