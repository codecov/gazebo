import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

const TestResultSchema = z.object({
  updatedAt: z.string(),
  name: z.string(),
  commitsFailed: z.number().nullable(),
  failureRate: z.number().nullable(),
  flakeRate: z.number().nullable(),
  avgDuration: z.number().nullable(),
})

export const OrderingDirection = {
  DESC: 'DESC',
  ASC: 'ASC',
} as const

export const OrderingParameter = {
  AVG_DURATION: 'AVG_DURATION',
  FLAKE_RATE: 'FLAKE_RATE',
  FAILURE_RATE: 'FAILURE_RATE',
  COMMITS_WHERE_FAIL: 'COMMITS_WHERE_FAIL',
  UPDATED_AT: 'UPDATED_AT',
} as const

export const TestResultsOrdering = z.object({
  direction: z.nativeEnum(OrderingDirection),
  parameter: z.nativeEnum(OrderingParameter),
})

type TestResult = z.infer<typeof TestResultSchema>

const GetTestResultsSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          testResults: z.object({
            edges: z.array(
              z.object({
                node: TestResultSchema,
              })
            ),
            pageInfo: z.object({
              endCursor: z.string().nullable(),
              hasNextPage: z.boolean(),
            }),
          }),
        }),
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
query GetTestResults(
  $owner: String!
  $repo: String!
  $filters: TestResultsFilters
  $ordering: TestResultsOrdering
  $first: Int
  $after: String
  $last: Int
  $before: String
) {
  owner(username: $owner) {
    repository: repository(name: $repo) {
      __typename
      ... on Repository {
        testResults(
          filters: $filters
          ordering: $ordering
          first: $first
          after: $after
          last: $last
          before: $before
        ) {
          edges {
            node {
              updatedAt
              avgDuration
              name
              failureRate
              flakeRate
              commitsFailed
            }
          }
          pageInfo {
            endCursor
            hasNextPage
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
}
`

interface UseTestResultsArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    branch?: string
  }
  ordering?: z.infer<typeof TestResultsOrdering>
  first?: number
  after?: string
  last?: number
  before?: string
  opts?: UseInfiniteQueryOptions<{
    testResults: TestResult[]
    pageInfo: { endCursor: string | null; hasNextPage: boolean }
  }>
}

export const useInfiniteTestResults = ({
  provider,
  owner,
  repo,
  filters,
  first = 20,
  after,
  last,
  before,
  ordering,
  opts = {},
}: UseTestResultsArgs) => {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: [
      'GetTestResults',
      provider,
      owner,
      repo,
      filters,
      first,
      after,
      last,
      before,
      ordering,
    ],
    queryFn: ({ pageParam = after, signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          filters,
          ordering,
          first,
          after: pageParam,
          last,
          before,
        },
      }).then((res) => {
        const parsedData = GetTestResultsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useInfiniteTestResults - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useInfiniteTestResults - 404 Not found error',
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
            dev: 'useInfiniteTestResults - 403 Owner not activated',
          } satisfies NetworkErrorObject)
        }

        return {
          testResults: mapEdges(data?.owner?.repository?.testResults).filter(
            (item): item is TestResult => item !== null
          ),
          pageInfo: data?.owner?.repository?.testResults?.pageInfo ?? {
            hasNextPage: false,
            endCursor: null,
          },
        }
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.pageInfo?.hasNextPage
        ? lastPage.pageInfo.endCursor
        : undefined
    },
    ...opts,
  })

  const memoedData = useMemo(
    () => data?.pages?.flatMap((page) => page.testResults) ?? [],
    [data]
  )

  return {
    data: {
      testResults: memoedData,
    },
    ...rest,
  }
}
