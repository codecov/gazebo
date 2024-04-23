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
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

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
  username: z.string().nullable(),
  repositoryConfig: RepositoryConfigSchema,
  commit: z
    .object({
      pathContents: PathContentsUnionSchema.nullish(),
    })
    .nullable(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      repository: RepositorySchema,
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
          console.log('fail', parsedRes.error)
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoCommitContents - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }
        const data = parsedRes.data

        let results
        const pathContentsType =
          data?.owner?.repository?.commit?.pathContents?.__typename
        if (pathContentsType === 'PathContents') {
          results = data?.owner?.repository?.commit?.pathContents?.results
        }
        console.log(results, 'results')
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
