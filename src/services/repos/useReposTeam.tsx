import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

import { orderingOptions } from './config'

const RepositorySchema = z
  .object({
    name: z.string(),
    active: z.boolean(),
    activated: z.boolean().nullable(),
    private: z.boolean(),
    latestCommitAt: z.string().nullable(),
    coverageAnalytics: z
      .object({
        lines: z.number().nullable(),
      })
      .nullable(),
    author: z.object({
      username: z.string().nullable(),
    }),
    coverageEnabled: z.boolean().nullable(),
    bundleAnalysisEnabled: z.boolean().nullable(),
  })
  .nullable()

export type Repository = z.infer<typeof RepositorySchema>

const RequestSchema = z.object({
  owner: z
    .object({
      isCurrentUserPartOfOrg: z.boolean(),
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

const query = `query GetReposTeam(
  $filters: RepositorySetFilters!
  $owner: String!
  $ordering: RepositoryOrdering!
  $direction: OrderingDirection!
  $after: String
  $first: Int
) {
  owner(username: $owner) {
    isCurrentUserPartOfOrg
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
          latestCommitAt
          coverageAnalytics {
            lines
          }
          author {
            username
          }
          coverageEnabled
          bundleAnalysisEnabled
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`

interface UseReposTeamArgs {
  activated?: boolean
  term?: string
  owner: string
  sortItem?: {
    ordering?: string
    direction: string
  }
  first?: number
  repoNames?: string[]
}

export function useReposTeam({
  activated,
  term,
  owner,
  sortItem = orderingOptions[0],
  first = 20,
  repoNames,
  ...options
}: UseReposTeamArgs) {
  const { provider } = useParams<{ provider: string }>()
  const variables = {
    filters: { activated, term, repoNames },
    ordering: sortItem?.ordering,
    direction: sortItem?.direction,
    first,
  }

  return useInfiniteQuery({
    queryKey: ['GetReposTeam', provider, variables, owner],
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

        const owner = parsedRes.data?.owner

        return {
          repos: mapEdges(owner?.repositories),
          pageInfo: owner?.repositories?.pageInfo,
          isCurrentUserPartOfOrg: !!owner?.isCurrentUserPartOfOrg,
        }
      })
    },
    getNextPageParam: (data) =>
      data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    ...options,
  })
}
