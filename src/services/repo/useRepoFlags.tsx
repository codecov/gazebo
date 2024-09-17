import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import z from 'zod'

import { OrderingDirection } from 'types'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

const query = `
query FlagMeasurements(
  $name: String!
  $repo: String!
  $filters: FlagSetFilters
  $orderingDirection: OrderingDirection!
  $interval: MeasurementInterval!
  $afterDate: DateTime!
  $beforeDate: DateTime!
  $after: String
) {
  owner(username: $name) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        coverageAnalytics {
          flags(
            filters: $filters
            orderingDirection: $orderingDirection
            after: $after
            first: 15
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                name
                percentCovered
                percentChange
                measurements(
                  interval: $interval
                  after: $afterDate
                  before: $beforeDate
                ) {
                  avg
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export const FlagEdgeSchema = z.object({
  name: z.string(),
  percentCovered: z.number().nullable(),
  percentChange: z.number().nullable(),
  measurements: z.array(
    z.object({
      avg: z.number().nullable(),
    })
  ),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  flags: z.object({
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().nullable(),
    }),
    edges: z.array(
      z.object({
        node: FlagEdgeSchema.nullable(),
      })
    ),
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

interface FetchRepoFlagsArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    flagNames?: string[]
    ter?: string
  }
  orderingDirection: OrderingDirection
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  afterDate: string
  beforeDate: string
  after: string
  signal?: AbortSignal
}

function fetchRepoFlags({
  provider,
  owner: name,
  repo,
  filters,
  orderingDirection,
  interval,
  afterDate,
  beforeDate,
  after,
  signal,
}: FetchRepoFlagsArgs) {
  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      name,
      repo,
      filters,
      orderingDirection,
      interval,
      afterDate,
      beforeDate,
      after,
    },
  }).then((res) => {
    const parsedRes = RequestSchema.safeParse(res?.data)

    if (!parsedRes.success) {
      return Promise.reject({
        status: 404,
        data: {},
        dev: `useRepoFlags - 404 failed to parse`,
      } satisfies NetworkErrorObject)
    }

    const data = parsedRes.data

    if (data?.owner?.repository?.__typename === 'NotFoundError') {
      return Promise.reject({
        status: 404,
        data: {},
        dev: `useRepoFlags - 404 NotFoundError`,
      } satisfies NetworkErrorObject)
    }

    if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
      return Promise.reject({
        status: 403,
        data: {
          detail: (
            <p>
              Activation is required to view this repo, please{' '}
              <A
                to={{ pageName: 'membersTab' }}
                hook="activate-members"
                isExternal={false}
              >
                click here{' '}
              </A>{' '}
              to activate your account.
            </p>
          ),
        },
        dev: `useRepoFlags - 403 OwnerNotActivatedError`,
      } satisfies NetworkErrorObject)
    }

    const flags = data?.owner?.repository?.flags
    return {
      flags: mapEdges(flags),
      pageInfo: flags?.pageInfo,
    }
  })
}

interface UseRepoFlagsArgs {
  filters?: {
    flagNames?: string[]
    term?: string
  }
  orderingDirection?: OrderingDirection
  interval: 'INTERVAL_30_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_1_DAY'
  afterDate: string
  beforeDate: string
  opts?: {
    suspense?: boolean
  }
}

export function useRepoFlags({
  filters = {},
  orderingDirection = 'DESC',
  interval,
  afterDate,
  beforeDate,
  opts = {},
}: UseRepoFlagsArgs) {
  const { provider, owner, repo } = useParams<{
    provider: string
    owner: string
    repo: string
  }>()

  const { data, ...rest } = useInfiniteQuery({
    queryKey: [
      'RepoFlags',
      provider,
      owner,
      repo,
      filters,
      orderingDirection,
      interval,
      afterDate,
      beforeDate,
    ],
    queryFn: ({ pageParam: after, signal }) =>
      fetchRepoFlags({
        provider,
        owner,
        repo,
        filters: filters,
        orderingDirection,
        interval,
        afterDate,
        beforeDate,
        after,
        signal,
      }),
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    ...opts,
  })

  return {
    data: data?.pages.map((page) => page?.flags).flat() ?? [],
    ...rest,
  }
}
