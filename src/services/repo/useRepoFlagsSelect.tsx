import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import { mapEdges } from '../../shared/utils/graphql'

interface FetchRepoFlagsArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    flagNames?: string[]
    term?: string
  }
  after: string
  signal?: AbortSignal
}

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  flags: z.object({
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().nullable(),
    }),
    edges: z.array(
      z.object({
        node: z.object({
          name: z.string(),
        }),
      })
    ),
  }),
})

export const FetchRepoFlagsSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

function fetchRepoFlags({
  provider,
  owner,
  repo,
  filters,
  after,
  signal,
}: FetchRepoFlagsArgs) {
  const query = `
    query FlagsSelect(
      $owner: String!
      $repo: String!
      $filters: FlagSetFilters!
      $after: String
    ) {
      owner(username: $owner) {
        repository(name: $repo) {
          __typename
          ... on Repository {
            flags(filters: $filters, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  name
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
  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      owner,
      repo,
      filters,
      after,
    },
  }).then((res) => {
    const parsedRes = FetchRepoFlagsSchema.safeParse(res?.data)

    if (!parsedRes.success) {
      console.log('FAILED', res?.data)
      console.log(parsedRes.error, res.data.owner.repository.__typename)
      return Promise.reject({
        status: 404,
        data: {},
        dev: `useRepoFlagsSelect - 404 failed to parse`,
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
    const pageInfo = flags?.pageInfo ?? null

    return {
      flags: mapEdges(flags) ?? [],
      pageInfo: pageInfo,
    }
  })
}

interface FetchRepoFlagsForPullArgs {
  provider: string
  owner: string
  repo: string
  filters?: {
    term?: string
  }
  after: string
  pullId: string
  signal?: AbortSignal
}

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  flagComparisons: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .nullable(),
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

const PullRepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z.object({
    compareWithBase: CompareWithBaseSchema.nullable(),
  }),
})

const FetchRepoFlagsForPullSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          PullRepositorySchema,
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

function fetchRepoFlagsForPull({
  provider,
  owner,
  repo,
  filters,
  after,
  pullId,
  signal,
}: FetchRepoFlagsForPullArgs) {
  const query = `
  query PullFlagsSelect($owner: String!, $repo: String!, $pullId: Int!, $filters: FlagComparisonFilters) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          pull(id: $pullId) {
            compareWithBase {
              __typename
              ... on Comparison {
                flagComparisons(filters: $filters) {
                  name
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
  }
`
  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      provider,
      owner,
      after,
      filters,
      repo,
      pullId: parseInt(pullId, 10),
    },
  }).then((res) => {
    const parsedRes = FetchRepoFlagsForPullSchema.safeParse(res?.data)
    console.log('WORK ALL DAY')

    if (!parsedRes.success) {
      console.log('FAILED 2', parsedRes.error)
      return Promise.reject({
        status: 404,
        data: null,
      })
    }

    const data = parsedRes.data
    console.log('@222', data)
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

    let flags = null

    if (
      data?.owner?.repository?.pull.compareWithBase?.__typename === 'Comparison'
    ) {
      flags = data?.owner?.repository?.pull?.compareWithBase?.flagComparisons
    }

    return {
      flags: flags ?? [],
      pageInfo: null,
    }
  })
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId?: string
}

export function useRepoFlagsSelect(
  { filters, options } = { filters: {}, options: {} }
) {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['flags', provider, owner, repo, pullId, filters],
    queryFn: ({ pageParam: after, signal }) => {
      if (pullId) {
        return fetchRepoFlagsForPull({
          provider,
          owner,
          repo,
          pullId,
          signal,
          filters,
          after,
        })
      }
      return fetchRepoFlags({
        provider,
        owner,
        repo,
        filters,
        after,
        signal,
      })
    },
    getNextPageParam: (data) => {
      if (data?.pageInfo?.hasNextPage) {
        return data?.pageInfo.endCursor
      }
      return undefined
    },
    ...options,
  })

  return {
    data: data?.pages?.map((page) => page?.flags).flat() ?? null,
    ...rest,
  }
}
