import Api from 'shared/api'
import { useQuery } from 'react-query'
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

  return useQuery([provider, owner, repo, 'branches'], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
      },
    }).then((res) => {
      const { branches } = res?.data?.owner?.repository
      return mapEdges(branches)
    })
  })
}
