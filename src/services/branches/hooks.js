import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

export function useBranches({ provider, owner, repo }) {
  const query = `
    query GetBranches($owner: String!, $repo: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            branches{
                edges{
                    node{
                        name
                    }
                }
            }
          }
        }
      }
    `

  return useQuery(['branches', provider, owner, repo], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
      },
    }).then((res) => {
      return mapEdges(res?.data?.owner?.repository?.branches)
    })
  })
}
