import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { RepoConfig } from 'services/repo/useRepoConfig'
import Api from 'shared/api'

import { query } from './constants'

interface FetchRepoContentsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  path: string
  filters?: {}
  signal?: AbortSignal
}

const BasePathContentSchema = z.object({
  hits: z.number().nullable(),
  misses: z.number().nullable(),
  partials: z.number().nullable(),
  lines: z.number().nullable(),
  name: z.string(),
  path: z.string().nullable(),
  percentCovered: z.number().nullable(),
})

const PathContentFileSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentFile'),
  isCriticalFile: z.boolean().nullish(),
})

const PathContentDirSchema = BasePathContentSchema.extend({
  __typename: z.literal('PathContentDir'),
})

const PathContentsResultSchema = z
  .union([PathContentFileSchema, PathContentDirSchema])
  .nullable()

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
])

export type PathContentResultType = z.infer<typeof PathContentsResultSchema>

const BranchContentsSchema = z.object({
  owner: z
    .object({
      repository: z.object({
        repoConfig: RepoConfig,
        branch: z.object({
          head: z
            .object({
              pathContents: PathContentsUnionSchema,
            })
            .nullable(),
        }),
      }),
    })
    .nullable(),
})

function fetchRepoContents({
  provider,
  owner,
  repo,
  branch,
  path,
  filters,
  signal,
}: FetchRepoContentsArgs) {
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
    const parsedData = BranchContentsSchema.safeParse(res?.data)

    if (!parsedData.success) {
      return null
    }

    let results
    const pathContentsType =
      parsedData?.data?.owner?.repository?.branch?.head?.pathContents
        ?.__typename
    if (pathContentsType === 'PathContents') {
      results =
        parsedData?.data?.owner?.repository?.branch?.head?.pathContents?.results
    }
    return {
      results: results ?? null,
      pathContentsType,
      indicationRange:
        parsedData?.data?.owner?.repository?.repoConfig?.indicationRange,
      __typename: res?.data?.owner?.repository?.branch?.head?.__typename,
    }
  })
}

interface RepoBranchContentsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  path: string
  filters?: {}
  opts?: {
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
  ...options
}: RepoBranchContentsArgs) {
  return useQuery({
    queryKey: [
      'BranchContents',
      provider,
      owner,
      repo,
      branch,
      path,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      fetchRepoContents({
        provider,
        owner,
        repo,
        branch,
        path,
        filters,
        signal,
      }),
    ...options,
  })
}
