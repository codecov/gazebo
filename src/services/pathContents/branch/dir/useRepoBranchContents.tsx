import * as Sentry from '@sentry/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

import { query } from './constants'
import {
  PathContentConnectionSchema,
  PathContentsResultSchema,
  MissingCoverageSchema,
  RepositorySchema,
  UnknownPathSchema,
} from './schemas'

export { PathContentConnectionSchema, MissingCoverageSchema, UnknownPathSchema }
export type PathContentsSchemaType = z.infer<typeof PathContentsResultSchema>
export type PathContentResultType = z.infer<typeof PathContentsResultSchema>

const BranchContentsSchema = z.object({
  owner: z
    .object({
      username: z.string(),
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

interface RepoBranchContentsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  path: string
  filters?: object
  options?: {
    suspense?: boolean
    enabled?: boolean
  }
}

export function useRepoBranchContents({
  provider,
  owner,
  repo,
  branch,
  path,
  filters,
  options,
}: RepoBranchContentsArgs) {
  return useInfiniteQuery({
    queryKey: ['BranchContents', provider, owner, repo, branch, path, filters],
    queryFn: ({ signal, pageParam }) => {
      return Sentry.startSpan({ name: 'fetch branch contents' }, () => {
        return Api.graphql({
          provider,
          query,
          signal,
          variables: {
            name: owner,
            repo,
            branch,
            path,
            filters,
            after: pageParam,
          },
        }).then((res) => {
          const callingFn = 'useRepoBranchContents'
          const parsedRes = BranchContentsSchema.safeParse(res?.data)

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

          let results = null
          const pathContents =
            data?.owner?.repository?.branch?.head?.deprecatedPathContents
          if (
            pathContents &&
            pathContents?.__typename === 'PathContentConnection'
          ) {
            results = mapEdges({
              edges: pathContents?.edges,
            })

            return {
              results,
              pathContentsType: pathContents.__typename,
              indicationRange:
                data?.owner?.repository?.repositoryConfig?.indicationRange,
              pageInfo: pathContents?.pageInfo,
            }
          }

          return {
            results,
            pathContentsType: pathContents?.__typename,
            indicationRange:
              data?.owner?.repository?.repositoryConfig?.indicationRange,
            pageInfo: null,
          }
        })
      })
    },
    getNextPageParam: (lastPage) => lastPage.pageInfo?.endCursor ?? undefined,
    ...options,
  })
}
