import { useInfiniteQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { RepositoryConfigSchema } from 'services/repo/useRepoConfig'
import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

import { orderingOptions } from './config'

const RepositorySchema = z
  .object({
    name: z.string(),
    active: z.boolean(),
    activated: z.boolean().nullable(),
    private: z.boolean(),
    coverageAnalytics: z
      .object({
        percentCovered: z.number().nullish(),
        lines: z.number().nullable(),
      })
      .nullable(),
    latestCommitAt: z.string().nullable(),
    author: z.object({
      username: z.string().nullable(),
    }),
    repositoryConfig: RepositoryConfigSchema,
    updatedAt: z.string().nullable(),
    coverageEnabled: z.boolean().nullable(),
    bundleAnalysisEnabled: z.boolean().nullable(),
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

const query = `query ReposForOwner(
  $filters: RepositorySetFilters!
  $owner: String!
  $ordering: RepositoryOrdering!
  $direction: OrderingDirection!
  $after: String
  $first: Int
) {
  owner(username: $owner) {
    repositories(
      filters: $filters
      ordering: $ordering
      orderingDirection: $direction
      first: $first
      after: $after
    ) {
      edges {
        node {
          name
          active
          activated
          private
          coverageAnalytics {
            percentCovered
            lines
          }
          updatedAt
          latestCommitAt
          author {
            username
          }
          coverageEnabled
          bundleAnalysisEnabled
          repositoryConfig {
            indicationRange {
              upperRange
              lowerRange
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
}`

interface UseReposArgs {
  provider: string
  owner: string
  activated?: boolean
  term?: string
  sortItem?: {
    ordering?: string
    direction: string
  }
  first?: number
  repoNames?: string[]
  isPublic?: true | false | null
}

export function useRepos({
  provider,
  owner,
  activated,
  term,
  sortItem = orderingOptions[0],
  first = 20,
  repoNames,
  isPublic = null, // by default, get both public and private repos
  ...options
}: UseReposArgs) {
  const variables = {
    filters: { activated, term, repoNames, isPublic },
    ordering: sortItem?.ordering,
    direction: sortItem?.direction,
    first,
  }

  return useInfiniteQuery({
    queryKey: ['repos', provider, owner, variables],
    queryFn: ({ pageParam, signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          ...variables,
          owner,
          after: pageParam,
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
    },
    suspense: false,
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    ...options,
  })
}
