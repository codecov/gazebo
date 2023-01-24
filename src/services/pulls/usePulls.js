import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchRepoPulls({ provider, owner, repo, variables, after, signal }) {
  const PullFragment = `
   fragment PullFragment on Pull {
        pullId
        title
        state
        updatestamp
        author{
            username
            avatarUrl
        }
        head{
            totals{
                coverage
            }
        }
        compareWithBase: compareWithBaseTemp {
          patchTotals{
            coverage
          }
          changeWithParent
        }         
    }
  `
  const query = `
      query GetPulls($owner: String!, $repo: String!, $orderingDirection: OrderingDirection, $filters: PullsSetFilters, $after: String){
            owner(username:$owner){
                repository(name:$repo){
                    pulls(orderingDirection: $orderingDirection, filters: $filters, first: 20, after: $after){
                        edges{
                            node{
                             ...PullFragment       
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
      ${PullFragment} 
   `

  return Api.graphql({
    provider,
    repo,
    query,
    signal,
    variables: {
      owner,
      repo,
      ...variables,
      after,
    },
  }).then((res) => {
    const { pulls } = res?.data?.owner?.repository

    return {
      pulls: pulls?.edges,
      pageInfo: pulls.pageInfo,
    }
  })
}

export function usePulls({
  provider,
  owner,
  repo,
  filters,
  orderingDirection,
  options = {},
}) {
  const variables = {
    filters,
    orderingDirection,
  }
  const { data, ...rest } = useInfiniteQuery(
    ['pulls', provider, owner, repo, variables],
    ({ pageParam, signal }) =>
      fetchRepoPulls({
        provider,
        owner,
        repo,
        variables,
        after: pageParam,
        signal,
      }),
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
      ...options,
    }
  )

  return {
    data: { pulls: data?.pages.map((page) => page?.pulls).flat() },
    ...rest,
  }
}
