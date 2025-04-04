import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { FirstPullRequestSchema } from 'services/comparison/schemas/FirstPullRequest'
import { MissingBaseCommitSchema } from 'services/comparison/schemas/MissingBaseCommit'
import { MissingBaseReportSchema } from 'services/comparison/schemas/MissingBaseReport'
import { MissingComparisonSchema } from 'services/comparison/schemas/MissingComparison'
import { MissingHeadCommitSchema } from 'services/comparison/schemas/MissingHeadCommit'
import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { usePullCompareTotalsTeam } from './usePullCompareTotalsTeam'

export const OrderingDirection = {
  desc: 'DESC',
  asc: 'ASC',
} as const

export const OrderingParameter = {
  FILE_NAME: 'FILE_NAME',
  MISSES_COUNT: 'MISSES_COUNT',
  PATCH_COVERAGE: 'PATCH_COVERAGE',
} as const

interface ImpactedFilesOrdering {
  direction?: (typeof OrderingDirection)[keyof typeof OrderingDirection]
  parameter?: (typeof OrderingParameter)[keyof typeof OrderingParameter]
}

const CoverageObjSchema = z
  .object({
    coverage: z.number().nullable(),
  })
  .nullable()

const ImpactedFileSchema = z
  .object({
    headName: z.string().nullable(),
    missesCount: z.number(),
    patchCoverage: CoverageObjSchema,
  })
  .nullable()

export type ImpactedFile = z.infer<typeof ImpactedFileSchema>

const ImpactedFilesSchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('ImpactedFiles'),
    results: z.array(ImpactedFileSchema).nullable(),
  }),
  z.object({
    __typename: z.literal('UnknownFlags'),
    message: z.string(),
  }),
])

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  state: z.string(),
  patchTotals: CoverageObjSchema.nullable(),
  impactedFiles: ImpactedFilesSchema,
})

const CompareWithBaseSchema = z.discriminatedUnion('__typename', [
  ComparisonSchema,
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
])

const PullSchema = z.object({
  pullId: z.number().nullable(),
  compareWithBase: CompareWithBaseSchema.nullable(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: PullSchema.nullable(),
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

const query = `query GetPullTeam(
  $owner: String!
  $repo: String!
  $pullId: Int!
  $filters: ImpactedFilesFilters
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          pullId
          compareWithBase {
            __typename
            ... on Comparison {
              __typename
              state
              patchTotals {
                coverage: percentCovered
              }
              impactedFiles(filters: $filters) {
                __typename
                ... on ImpactedFiles {
                  results {
                    headName
                    missesCount
                    patchCoverage {
                      coverage: percentCovered
                    }
                  }
                }
                ... on UnknownFlags {
                  message
                }
              }
            }
            ... on FirstPullRequest {
              message
            }
            ... on MissingBaseCommit {
              message
            }
            ... on MissingHeadCommit {
              message
            }
            ... on MissingComparison {
              message
            }
            ... on MissingBaseReport {
              message
            }
            ... on MissingHeadReport {
              message
            }
          }
        }
      }
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`

interface UsePullTeamArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
  filters?: {
    hasUnintendedChanges?: boolean
    ordering?: ImpactedFilesOrdering
  }
  refetchInterval?: number
}

export function usePullTeam({
  provider,
  owner,
  repo,
  pullId,
  filters = {},
  refetchInterval = 2000,
}: UsePullTeamArgs) {
  const queryClient = useQueryClient()
  const pullKey = ['GetPullTeam', provider, owner, repo, pullId, query, filters]

  const pullQuery = useQuery({
    queryKey: pullKey,
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          filters,
        },
      }).then((res) => {
        const callingFn = 'usePullTeam'
        const parsedRes = RequestSchema.safeParse(res?.data)

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

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn },
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

        const pull = data?.owner?.repository?.pull

        if (!pull) {
          return { pull: null }
        }

        return {
          pull: { ...pull },
        }
      }),
    suspense: false,
  })

  let shouldPoll = false
  if (pullQuery?.data?.pull?.compareWithBase?.__typename === 'Comparison') {
    shouldPoll = pullQuery?.data?.pull?.compareWithBase?.state === 'pending'
  }

  usePullCompareTotalsTeam({
    provider,
    owner,
    repo,
    pullId,
    filters,
    opts: {
      refetchInterval,
      enabled: shouldPoll,
      suspense: false,
      onSuccess: (data) => {
        let compareWithBase = undefined
        if (data?.compareWithBase?.__typename === 'Comparison') {
          compareWithBase = data?.compareWithBase
        }

        const impactedFileData = {
          ...pullQuery?.data,
          pull: {
            ...pullQuery?.data?.pull,
            compareWithBase,
          },
        }

        queryClient.setQueryData(pullKey, impactedFileData)
      },
    },
  })

  return pullQuery
}
