import Api from 'shared/api'
import { useQuery } from 'react-query'

function fetchRepoPulls({ provider, owner, repo }) {
  //some don't have base or head (?)
  const query = `
        query GetPulls($owner: String!, $repo: String!){
            owner(username:$owner){
                username
                repository(name:$repo){
                    pulls{
                        edges{
                            node{
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
                        }
                   }
                }
            }
       }   
   `

  return Api.graphql({
    provider,
    repo,
    query,
    variables: {
      owner,
      repo,
    },
  }).then((res) => {
    const { edges } = res?.data?.owner?.repository?.pulls
    if (!edges) return null
    return edges
  })
}

export function usePulls({ provider, owner, repo }) {
  return useQuery([provider, owner, repo, 'pulls'], () => {
    return fetchRepoPulls({ provider, owner, repo })
  })
}
