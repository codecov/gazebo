import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoConfig } from 'services/repo/useRepoConfig'
import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

import { orderingOptions } from './config'

const repositoryFragment = `
  fragment RepoForList on Repository {
    name
    active
    activated
    private
    coverage
    updatedAt
    latestCommitAt
    lines
    author {
      username
    }
    repositoryConfig {
      indicationRange {
        upperRange
        lowerRange
      }
    }
  }
`

interface FetchMyReposArgs {
  provider: string
  variables: any
  after: string
  signal?: AbortSignal
}

const RepositorySchema = z
  .object({
    name: z.string(),
    active: z.boolean(),
    activated: z.boolean().nullable(),
    private: z.boolean(),
    coverage: z.number().nullish(),
    latestCommitAt: z.string().nullable(),
    lines: z.number().nullable(),
    author: z.object({
      username: z.string().nullable(),
    }),
    repositoryConfig: RepoConfig,
    updatedAt: z.string().nullable(),
  })
  .nullable()

export type RepositoryResult = z.infer<typeof RepositorySchema>

const RequestSchema = z.object({
  owner: z
    .object({
      repositories: z
        .object({
          edges: z.array(
            z.object({
              node: RepositorySchema,
            })
          ),
          pageInfo: z.object({
            hasNextPage: z.boolean(),
            endCursor: z.string().nullable(),
          }),
        })
        .nullable(),
    })
    .nullable(),
})

const RequestSchemaMyRepos = z.object({
  me: z
    .object({
      viewableRepositories: z
        .object({
          edges: z.array(
            z.object({
              node: RepositorySchema,
            })
          ),
          pageInfo: z.object({
            hasNextPage: z.boolean(),
            endCursor: z.string().nullable(),
          }),
        })
        .nullable(),
    })
    .nullable(),
})

function fetchMyRepos({
  provider,
  variables,
  after,
  signal,
}: FetchMyReposArgs) {
  const query = `
    query MyRepos($filters: RepositorySetFilters!, $ordering: RepositoryOrdering!, $direction: OrderingDirection!, $after: String) {
        me {
          viewableRepositories(filters: $filters, ordering: $ordering, orderingDirection: $direction, first: 20, after: $after) {
            edges {
              node {
                ...RepoForList
              }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
          }
        }
      }

      ${repositoryFragment}
  `

  return Api.graphql({
    provider,
    query,
    signal,
    variables: { ...variables, after },
  }).then((res) => {
    const parsedRes = RequestSchemaMyRepos.safeParse(res?.data)

    if (!parsedRes.success) {
      return Promise.reject({
        status: 404,
        data: null,
      })
    }

    const me = parsedRes.data.me
    return {
      repos: mapEdges(me?.viewableRepositories),
      pageInfo: me?.viewableRepositories?.pageInfo,
    }
  })
}

interface FetchReposForOwnerArgs {
  provider: string
  variables: any
  owner: string
  after: string
  signal?: AbortSignal
}

function fetchReposForOwner({
  provider,
  variables,
  owner,
  after,
  signal,
}: FetchReposForOwnerArgs) {
  const query = `
    query ReposForOwner($filters: RepositorySetFilters!, $owner: String!, $ordering: RepositoryOrdering!, $direction: OrderingDirection!, $after: String, $first: Int) {
        owner(username: $owner) {
          repositories(filters: $filters, ordering: $ordering, orderingDirection: $direction, first: $first, after: $after) {
            edges {
              node {
                ...RepoForList
              }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
          }
        }
      }

      ${repositoryFragment}
  `

  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      ...variables,
      owner,
      after,
    },
  }).then((res) => {
    const parsedRes = RequestSchema.safeParse(res?.data)
    if (!parsedRes.success) {
      return Promise.reject({
        status: 404,
        data: null,
      })
    }

    const owner = parsedRes?.data?.owner
    return {
      repos: mapEdges(owner?.repositories),
      pageInfo: owner?.repositories?.pageInfo,
    }
  })
}

interface UseReposArgs {
  activated?: boolean
  term?: string
  owner: string
  sortItem?: {
    ordering?: string
    direction: string
  }
  first?: number
  repoNames?: string[]
  isPublic?: true | false | null
}

export function useRepos({
  activated,
  term,
  owner,
  sortItem = orderingOptions[0],
  first = 20,
  repoNames,
  isPublic = null, // by default, get both public and private repos
  ...options
}: UseReposArgs) {
  const { provider } = useParams<{ provider: string }>()
  const variables = {
    filters: { activated, term, repoNames, isPublic },
    ordering: sortItem?.ordering,
    direction: sortItem?.direction,
    first,
  }

  return useInfiniteQuery({
    queryKey: ['repos', provider, variables, owner],
    queryFn: ({ pageParam, signal }) => {
      const data = owner
        ? fetchReposForOwner({
            provider,
            variables,
            owner,
            after: pageParam,
            signal,
          })
        : fetchMyRepos({ provider, variables, after: pageParam, signal })
      return data
    },
    suspense: false,
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    ...options,
  })
}
