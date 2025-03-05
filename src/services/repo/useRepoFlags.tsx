import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import z from 'zod'

import { OrderingDirection } from 'types'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

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
  coverageAnalytics: z
    .object({
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
    .nullable(),
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
    queryFn: ({ pageParam: after, signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
          filters,
          orderingDirection,
          interval,
          afterDate,
          beforeDate,
          after,
        },
      }).then((res) => {
        const callingFn = 'useRepoFlags'
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
          })
        }

        const flags = data?.owner?.repository?.coverageAnalytics?.flags
        return {
          flags: mapEdges(flags),
          pageInfo: flags?.pageInfo,
        }
      })
    },
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    ...opts,
  })

  return {
    data: data?.pages.map((page) => page?.flags).flat() ?? [],
    ...rest,
  }
}
