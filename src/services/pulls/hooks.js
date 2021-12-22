import Api from 'shared/api'
import { useQuery } from 'react-query'

function fetchRepoPulls({ provider, owner, repo, orderingDirection, filters }) {
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
      query GetPulls($owner: String!, $repo: String!, $orderingDirection: OrderingDirection, $filters: PullsSetFilters){
            owner(username:$owner){
                repository(name:$repo){
                    pulls(orderingDirection: $orderingDirection, filters: $filters){
                        edges{
                            node{
                             ...PullFragment       
                            }
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
      filters,
      orderingDirection,
    },
  }).then((res) => {
    const { edges } = res?.data?.owner?.repository?.pulls
    if (!edges) return null
    return edges
  })
}

export function usePulls({
  provider,
  owner,
  repo,
  filters,
  orderingDirection,
}) {
  return useQuery(
    [provider, owner, repo, filters, orderingDirection, 'pulls'],
    () => {
      return fetchRepoPulls({
        provider,
        owner,
        repo,
        orderingDirection,
        filters,
      })
    }
  )
}
