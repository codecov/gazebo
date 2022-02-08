import Api from 'shared/api'
import { useInfiniteQuery } from 'react-query'

function fetchRepoPulls({ provider, owner, repo, variables, after }) {
  const PullFragment = `
   fragment PullFragment on Pull {
        pullId
        title
        state
        updatestamp
        author{
            username
        }
        head{
            totals{
                coverage
            }
        }
        compareWithBase{
          patchTotals{
            coverage
          }
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
    variables: {
      owner,
      repo,
      ...variables,
      after,
    },
  }).then((res) => {
    const { pulls } = res?.data?.owner?.repository
    if (!pulls) return null

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
}) {
  const variables = {
    filters,
    orderingDirection,
  }
  const { data, ...rest } = useInfiniteQuery(
    [provider, owner, repo, variables, 'pulls'],
    ({ pageParam }) => {
      return fetchRepoPulls({
        provider,
        owner,
        repo,
        variables,
        after: pageParam,
      })
    },
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    }
  )

  return {
    data: { pulls: data?.pages.map((page) => page.pulls).flat() },
    ...rest,
  }
}
