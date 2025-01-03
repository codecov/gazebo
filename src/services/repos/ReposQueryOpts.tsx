import { infiniteQueryOptions as infiniteQueryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { RepositoryConfigSchema } from 'services/repo/useRepoConfig'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import { mapEdges } from 'shared/utils/graphql'

import {
  nonActiveOrderingOptions,
  OrderingDirection,
  orderingOptions,
  TeamOrdering,
} from './orderingOptions'

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

type RepositoryResult = z.infer<typeof RepositorySchema>

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

interface ReposQueryArgs {
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

function ReposQueryOpts({
  provider,
  owner,
  activated,
  term,
  sortItem = orderingOptions[0],
  first = 20,
  repoNames,
  isPublic = null, // by default, get both public and private repos
}: ReposQueryArgs) {
  const variables = {
    filters: { activated, term, repoNames, isPublic: Boolean(isPublic) },
    ordering: sortItem?.ordering,
    direction: sortItem?.direction,
    first,
  }

  return infiniteQueryOptionsV5({
    queryKey: ['repos', provider, owner, variables],
    queryFn: ({ pageParam, signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          ...variables,
          owner,
          after: pageParam === '' ? undefined : pageParam,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)
        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'ReposQueryOpts - 404 Failed to parse schema',
            error: parsedRes.error,
          })
        }

        return {
          repos: mapEdges(parsedRes?.data?.owner?.repositories),
          pageInfo: parsedRes?.data?.owner?.repositories?.pageInfo,
        }
      })
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      return data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : null
    },
  })
}

export {
  type RepositoryResult,
  ReposQueryOpts,
  orderingOptions,
  OrderingDirection,
  TeamOrdering,
  nonActiveOrderingOptions,
}
