import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchRepoOverviewInitial({ provider, owner, repo, signal }) {
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
    signal,
    variables: {
      name: owner,
      repo,
    },
  }).then((res) => res?.data?.owner?.repository || {})
}

export function useRepoOverview({ provider, owner, repo }) {
  return useQuery(['overview init', provider, owner, repo], ({ signal }) =>
    fetchRepoOverviewInitial({ provider, owner, repo, signal })
  )
}
