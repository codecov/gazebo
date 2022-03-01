import Api from 'shared/api'
import { useQuery } from 'react-query'

function fetchRepoPulls({ provider, owner, repo, variables }) {
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
        compareWithBase{
          patchTotals{
            coverage
          }
          changeWithParent
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
      ...variables,
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
  const variables = {
    filters,
    orderingDirection,
  }
  return useQuery([provider, owner, repo, variables, 'pulls'], () => {
    return fetchRepoPulls({
      provider,
      owner,
      repo,
      variables,
    })
  })
}
