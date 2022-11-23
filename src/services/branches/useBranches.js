import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

const query = `
  query GetBranches($owner: String!, $repo: String!, $after: String) {
    owner(username: $owner) {
      repository(name: $repo) {
        branches(first: 20, after: $after) {
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

export function useBranches({ provider, owner, repo, filters }) {
  const variables = {
    filters,
  }

  const { data, ...rest } = useInfiniteQuery(
    ['GetBranches', provider, owner, repo, variables],
    ({ pageParam, signal }) =>
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
    {
      getNextPageParam: (data) => {
        const pageParam = data?.pageInfo?.hasNextPage
          ? data?.pageInfo?.endCursor
          : undefined
        return pageParam
      },
    }
  )

  return {
    data: { branches: data?.pages?.map((page) => page?.branches).flat() },
    ...rest,
  }
}
