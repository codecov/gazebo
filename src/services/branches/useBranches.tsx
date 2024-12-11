import {
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import isArray from 'lodash/isArray'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const BranchSchema = z.object({
  name: z.string(),
  head: z
    .object({
      commitid: z.string(),
    })
    .nullable(),
})

export type Branch = z.infer<typeof BranchSchema>

const PageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
})

type PageInfo = z.infer<typeof PageInfoSchema>

const GetBranchesSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          branches: z.object({
            edges: z.array(
              z
                .object({
                  node: BranchSchema,
                })
                .nullable()
            ),
            pageInfo: PageInfoSchema,
          }),
        }),
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
  query GetBranches(
    $owner: String!
    $repo: String!
    $after: String
    $filters: BranchesSetFilters
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          branches(first: 20, after: $after, filters: $filters) {
            edges {
              node {
                name
                head {
                  commitid
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

type GetBranchesReturn = { branches: Branch[]; pageInfo: PageInfo | null }

interface UseBranchesFilters {
  searchValue?: string
  mergedBranches?: boolean
}

interface UseBranchesArgs {
  provider: string
  owner: string
  repo: string
  filters?: UseBranchesFilters
  opts?: UseInfiniteQueryOptions<GetBranchesReturn>
}

export function useBranches({
  provider,
  owner,
  repo,
  filters,
  opts = {},
}: UseBranchesArgs) {
  const variables = {
    filters,
  }

  if (
    filters &&
    !!filters.searchValue &&
    filters.mergedBranches === undefined
  ) {
    // include merged branches when we're searching
    filters.mergedBranches = true
  }

  const { data, ...rest } = useInfiniteQuery({
    queryKey: ['GetBranches', provider, owner, repo, variables, query],
    queryFn: ({ pageParam, signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          ...variables,
          after: pageParam,
        },
      }).then((res) => {
        const parsedData = GetBranchesSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBranches - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBranches - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
            dev: 'useBranches - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        const edges = data?.owner?.repository?.branches?.edges
        const branches: Branch[] = []
        if (isArray(edges)) {
          for (const edge of edges) {
            if (edge?.node) {
              branches.push(edge.node)
            }
          }
        }

        return {
          branches: branches,
          pageInfo: data?.owner?.repository?.branches?.pageInfo ?? null,
        }
      }),
    getNextPageParam: (data) => {
      const pageParam = data?.pageInfo?.hasNextPage
        ? data?.pageInfo?.endCursor
        : undefined
      return pageParam
    },
    ...opts,
  })

  return {
    data: {
      branches: data?.pages?.map((page) => page.branches).flat() ?? null,
    },
    ...rest,
  }
}
