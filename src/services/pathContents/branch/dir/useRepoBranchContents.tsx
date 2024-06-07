import * as Sentry from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { UnknownFlagsSchema } from 'services/impactedFiles/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import { RepositoryConfigSchema } from 'services/repo/useRepoConfig'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
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
  isCriticalFile: z.boolean(),
})

const PathContentDirSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentDir'),
})

const PathContentsResultSchema = z.discriminatedUnion('__typename', [
  PathContentFileSchema,
  PathContentDirSchema,
])

export const PathContentsSchema = z.object({
  __typename: z.literal('PathContents'),
  results: z.array(PathContentsResultSchema),
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
  PathContentsSchema,
  UnknownPathSchema,
  MissingCoverageSchema,
  MissingHeadReportSchema,
  UnknownFlagsSchema,
])

export type PathContentResultType = z.infer<typeof PathContentsResultSchema>

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema,
  branch: z.object({
    head: z
      .object({
        pathContents: PathContentsUnionSchema.nullish(),
      })
      .nullable(),
  }),
})

const BranchContentsSchema = z.object({
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

interface RepoBranchContentsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  path: string
  filters?: {}
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
  return useQuery({
    queryKey: ['BranchContents', provider, owner, repo, branch, path, filters],
    queryFn: ({ signal }) => {
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
          },
        }).then((res) => {
          const parsedRes = BranchContentsSchema.safeParse(res?.data)

          if (!parsedRes.success) {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'useRepoBranchContents - 404 schema parsing failed',
            } satisfies NetworkErrorObject)
          }

          const data = parsedRes.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'useRepoBranchContents - 404 NotFoundError',
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
                    {/* @ts-expect-error */}
                    <A to={{ pageName: 'membersTab' }}>click here </A> to
                    activate your account.
                  </p>
                ),
              },
              dev: 'useRepoBranchContents - 403 OwnerNotActivatedError',
            } satisfies NetworkErrorObject)
          }

          let results
          const pathContentsType =
            data?.owner?.repository?.branch?.head?.pathContents?.__typename
          if (pathContentsType === 'PathContents') {
            results =
              data?.owner?.repository?.branch?.head?.pathContents?.results
          }

          return {
            results: results ?? null,
            pathContentsType,
            indicationRange:
              data?.owner?.repository?.repositoryConfig?.indicationRange,
            __typename: res?.data?.owner?.repository?.branch?.head?.__typename,
          }
        })
      })
    },
    ...options,
  })
}
