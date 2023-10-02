import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query'
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

const PullStatesSchema = z.union([
  z.literal('OPEN'),
  z.literal('CLOSED'),
  z.literal('MERGED'),
])

type PullStates = z.infer<typeof PullStatesSchema>

const PullSchema = z
  .object({
    pullId: z.number().nullable(),
    title: z.string().nullable(),
    state: PullStatesSchema,
    updatestamp: z.string().nullable(),
    author: z
      .object({
        username: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      })
      .nullable(),
    head: z
      .object({
        totals: z
          .object({
            percentCovered: z.number().nullable(),
          })
          .nullable(),
      })
      .nullable(),
    compareWithBase: z
      .discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Comparison'),
          patchTotals: z
            .object({
              percentCovered: z.number().nullable(),
            })
            .nullable(),
          changeCoverage: z.number().nullable(),
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
  .nullable()

type Pull = z.infer<typeof PullSchema>

const PageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
})

type PageInfo = z.infer<typeof PageInfoSchema>

const GetPullsSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          pulls: z
            .object({
              edges: z.array(
                z
                  .object({
                    node: PullSchema,
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
query GetPulls(
  $owner: String!
  $repo: String!
  $orderingDirection: OrderingDirection
  $filters: PullsSetFilters
  $after: String
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pulls(
          orderingDirection: $orderingDirection
          filters: $filters
          first: 20
          after: $after
        ) {
          edges {
            node {
              pullId
              title
              state
              updatestamp
              author {
                username
                avatarUrl
              }
              head {
                totals {
                  percentCovered
                }
              }

              compareWithBase {
                __typename
                ... on Comparison {
                  patchTotals {
                    percentCovered
                  }
                  changeCoverage
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

type GetPullsReturn = { pulls: Array<Pull>; pageInfo: PageInfo | null }

interface UsePullArgs {
  provider: string
  owner: string
  repo: string
  filters: {
    state: PullStates
  }
  orderingDirection: 'ASC' | 'DESC'
  opts?: UseInfiniteQueryOptions<GetPullsReturn>
}

export function usePulls({
  provider,
  owner,
  repo,
  filters,
  orderingDirection,
  opts = {},
}: UsePullArgs) {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['pulls', provider, owner, repo, filters, orderingDirection],
    queryFn: ({ pageParam, signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          filters,
          orderingDirection,
          after: pageParam,
        },
      }).then((res) => {
        const parsedData = GetPullsSchema.safeParse(res?.data)

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

        const pulls = mapEdges(data?.owner?.repository?.pulls)

        return {
          pulls,
          pageInfo: data?.owner?.repository?.pulls?.pageInfo ?? null,
        }
      })
    },
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    ...opts,
  })

  return {
    data: { pulls: data?.pages.map((page) => page?.pulls).flat() },
    ...rest,
  }
}
