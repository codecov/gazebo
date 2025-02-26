import * as Sentry from '@sentry/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { UnknownFlagsSchema } from 'services/impactedFiles/schemas/UnknownFlags'
import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import { RepositoryConfigSchema } from 'services/repo/useRepoConfig'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

import { query } from './constants'

const BasePathContentSchema = z.object({
  hits: z.number(),
  misses: z.number(),
  partials: z.number(),
  lines: z.number(),
  name: z.string(),
  path: z.string().nullable(),
  percentCovered: z.number(),
})

const PathContentFileSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentFile'),
})

const PathContentDirSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentDir'),
})

const PathContentsResultSchema = z.discriminatedUnion('__typename', [
  PathContentFileSchema,
  PathContentDirSchema,
])

const PathContentEdgeSchema = z.object({
  node: PathContentsResultSchema,
})

export const PathContentConnectionSchema = z.object({
  __typename: z.literal('PathContentConnection'),
  edges: z.array(PathContentEdgeSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
})

export type PathContentsSchemaType = z.infer<typeof PathContentsResultSchema>

export const UnknownPathSchema = z.object({
  __typename: z.literal('UnknownPath'),
  message: z.string().nullish(),
})

export const MissingCoverageSchema = z.object({
  __typename: z.literal('MissingCoverage'),
  message: z.string().nullish(),
})

const MissingHeadReportSchema = z.object({
  __typename: z.literal('MissingHeadReport'),
  message: z.string().nullish(),
})

const PathContentsUnionSchema = z.discriminatedUnion('__typename', [
  PathContentConnectionSchema,
  UnknownPathSchema,
  MissingCoverageSchema,
  MissingHeadReportSchema,
  UnknownFlagsSchema,
])

export type PathContentResultType = z.infer<typeof PathContentsResultSchema>

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema,
  branch: z
    .object({
      head: z
        .object({
          deprecatedPathContents: PathContentsUnionSchema.nullish(),
        })
        .nullable(),
    })
    .nullable(),
})

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
          const parsedRes = BranchContentsSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return rejectNetworkError({
              errorName: 'Parsing Error',
              errorDetails: {
                callingFn: 'useRepoBranchContents',
                error: parsedRes.error,
              },
            })
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return rejectNetworkError({
              errorName: 'Not Found Error',
              errorDetails: {
                callingFn: 'useRepoBranchContents',
              },
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return rejectNetworkError({
              errorName: 'Owner Not Activated',
              errorDetails: {
                callingFn: 'useRepoBranchContents',
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
