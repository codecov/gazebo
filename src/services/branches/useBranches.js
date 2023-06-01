import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

const query = `
  query GetBranches(
    $owner: String!
    $repo: String!
    $after: String
    $filters: BranchesSetFilters
  ) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        branches(
          first: 20
          after: $after
          filters: $filters
        ) {
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
    }
  }
`

export function useBranches({ provider, owner, repo, filters, opts = {} }) {
  const variables = {
    filters,
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
      }).then((res) => ({
        branches: mapEdges(res?.data?.owner?.repository?.branches),
        pageInfo: res?.data?.owner?.repository?.branches?.pageInfo,
      })),
    getNextPageParam: (data) => {
      const pageParam = data?.pageInfo?.hasNextPage
        ? data?.pageInfo?.endCursor
        : undefined
      return pageParam
    },
    ...opts,
  })

  return {
    data: { branches: data?.pages?.map((page) => page?.branches).flat() },
    ...rest,
  }
}
