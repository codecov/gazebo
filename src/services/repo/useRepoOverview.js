import { useQuery } from 'react-query'

import Api from 'shared/api'

function fetchRepoOverviewInitial({ provider, owner, repo }) {
  const query = `
    query GetRepoOverview($name: String!, $repo: String!) {
      owner(username:$name){
        repository(name:$repo){
          private
          defaultBranch
          branches {
            edges {
              node {
                name
                head {
                  commitid
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
      name: owner,
      repo,
    },
  }).then((res) => res?.data?.owner?.repository || {})
}

export function useRepoOverview({ provider, owner, repo }) {
  return useQuery(['overview init', provider, owner, repo], () => {
    return fetchRepoOverviewInitial({ provider, owner, repo })
  })
}
