import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import isNumber from 'lodash/isNumber'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

const CommitStates = {
  COMPLETE: 'COMPLETE',
  PENDING: 'PENDING',
  ERROR: 'ERROR',
  SKIPPED: 'SKIPPED',
} as const

const CommitStatesEnumSchema = z.nativeEnum(CommitStates)

export type CommitStatsEnum = z.infer<typeof CommitStatesEnumSchema>

const AuthorSchema = z.object({
  username: z.string().nullable(),
  avatarUrl: z.string(),
})

const CommitSchema = z.object({
  ciPassed: z.boolean().nullable(),
  message: z.string().nullable(),
  commitid: z.string(),
  createdAt: z.string(),
  author: AuthorSchema.nullable(),
  totals: z
    .object({
      coverage: z.number().nullable(),
    })
    .nullable(),
  parent: z
    .object({
      totals: z
        .object({
          coverage: z.number().nullable(),
        })
        .nullable(),
    })
    .nullable(),
  compareWithParent: z
    .discriminatedUnion('__typename', [
      z.object({
        __typename: z.literal('Comparison'),
        patchTotals: z
          .object({
            percentCovered: z.number().nullable(),
          })
          .nullable(),
      }),
      FirstPullRequestSchema,
      MissingBaseCommitSchema,
      MissingBaseReportSchema,
      MissingComparisonSchema,
      MissingHeadCommitSchema,
      MissingHeadReportSchema,
    ])
    .nullable(),
})

export type Commit = z.infer<typeof CommitSchema>

const PageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
})

type PageInfo = z.infer<typeof PageInfoSchema>

const GetCommitsSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          commits: z
            .object({
              totalCount: z.number().nullish(),
              edges: z.array(
                z
                  .object({
                    node: CommitSchema,
                  })
                  .nullable()
              ),
              pageInfo: PageInfoSchema,
            })
            .nullable(),
        }),
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
query GetCommits(
  $owner: String!
  $repo: String!
  $filters: CommitsSetFilters
  $after: String
  $includeTotalCount: Boolean!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        commits(filters: $filters, first: 20, after: $after) {
          totalCount @include(if: $includeTotalCount)
          edges {
            node {
              ciPassed
              message
              commitid
              createdAt
              author {
                username
                avatarUrl
              }
              totals {
                coverage: percentCovered
              }
              parent {
                totals {
                  coverage: percentCovered
                }
              }
              compareWithParent {
                __typename
                ... on Comparison {
                  patchTotals {
                    percentCovered
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
          pageInfo {
            hasNextPage
            endCursor
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

type GetCommitsReturn = {
  commits: Array<Commit | null>
  commitsCount: number | null | undefined
  pageInfo: PageInfo | null
}

interface UseCommitsArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    hideFailedCI?: boolean
    branchName?: string
    pullId?: number
    search?: string
    states?: Array<CommitStatsEnum>
  }
  opts?: UseInfiniteQueryOptions<GetCommitsReturn>
}

export function useCommits({
  provider,
  owner,
  repo,
  filters,
  opts = {},
}: UseCommitsArgs) {
  const variables = {
    filters,
    includeTotalCount: isNumber(filters?.pullId),
  }

  return useInfiniteQuery({
    queryKey: ['GetCommits', provider, owner, repo, variables],
    queryFn: ({ pageParam, signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          ...variables,
          after: pageParam,
        },
      }).then((res) => {
        const parsedData = GetCommitsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
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
          })
        }

        const commits = mapEdges(data?.owner?.repository?.commits)
        const commitsCount =
          data?.owner?.repository?.commits?.totalCount ?? null
        const pageInfo = data?.owner?.repository?.commits?.pageInfo ?? null

        return { commits, commitsCount, pageInfo }
      })
    },
    getNextPageParam: (data) => {
      if (data?.pageInfo?.hasNextPage) {
        return data?.pageInfo.endCursor
      }
      return undefined
    },
    ...opts,
  })
}
