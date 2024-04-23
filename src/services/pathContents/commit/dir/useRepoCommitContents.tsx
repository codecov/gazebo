import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison/schemas'
import { UnknownFlagsSchema } from 'services/impactedFiles/schemas'
import {
  MissingCoverageSchema,
  PathContentsSchema,
  UnknownPathSchema,
} from 'services/pathContents/branch/dir'
import { PathContentsFilters } from 'services/pathContents/constants'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import { query } from './constants'

const RepositoryConfigSchema = z.object({
  indicationRange: z
    .object({
      upperRange: z.number(),
      lowerRange: z.number(),
    })
    .nullable(),
})

const PathContentsUnionSchema = z.discriminatedUnion('__typename', [
  PathContentsSchema,
  UnknownPathSchema,
  MissingCoverageSchema,
  MissingHeadReportSchema,
  UnknownFlagsSchema,
])

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema.nullish(),
  commit: z.object({
    pathContents: PathContentsUnionSchema.nullish(),
  }),
})

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

interface UseRepoCommitContentsArgs {
  provider: string
  owner: string
  repo: string
  commit: string
  path: string
  filters?: PathContentsFilters
  opts?: {
    suspense?: boolean
  }
}

export const useRepoCommitContents = ({
  provider,
  owner,
  repo,
  commit,
  path,
  filters,
  opts = {},
}: UseRepoCommitContentsArgs) => {
  return useQuery({
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
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoCommitContents - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }
        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoCommitContents - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
            dev: 'useRepoCommitContents - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        let results
        const pathContentsType =
          data?.owner?.repository?.commit?.pathContents?.__typename
        if (pathContentsType === 'PathContents') {
          results = data?.owner?.repository?.commit?.pathContents?.results
        }
        return {
          results: results ?? null,
          indicationRange:
            data?.owner?.repository?.repositoryConfig?.indicationRange,
          pathContentsType,
        }
      }),
    ...opts,
  })
}
