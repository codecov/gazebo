import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { z } from 'zod'

import { MEASUREMENT_INTERVAL_TYPE } from 'pages/RepoPage/shared/constants'
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
  totalFailCount: z.number(),
  totalSkipCount: z.number(),
  totalPassCount: z.number(),
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

export const TestResultsFilterParameter = {
  FLAKY_TESTS: 'FLAKY_TESTS',
  FAILED_TESTS: 'FAILED_TESTS',
  SLOWEST_TESTS: 'SLOWEST_TESTS',
  SKIPPED_TESTS: 'SKIPPED_TESTS',
} as const

export type TestResultsFilterParameterType =
  keyof typeof TestResultsFilterParameter

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
          testAnalytics: z
            .object({
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
        testAnalytics {
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
                totalFailCount
                totalSkipCount
                totalPassCount
              }
            }
            pageInfo {
              endCursor
              hasNextPage
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
}
`

interface UseTestResultsArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    branch?: string
    flags?: string[]
    history?: MEASUREMENT_INTERVAL_TYPE
    parameter?: TestResultsFilterParameterType
    term?: string
    test_suites?: string[]
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
          testResults: mapEdges(
            data?.owner?.repository?.testAnalytics?.testResults
          ).filter((item): item is TestResult => item !== null),
          pageInfo: data?.owner?.repository?.testAnalytics?.testResults
            ?.pageInfo ?? {
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
