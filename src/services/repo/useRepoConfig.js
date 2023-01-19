import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
  query RepoConfig($owner: String!, $repo: String!) {
    owner(username:$owner){
      repository(name:$repo){
        repositoryConfig {
          indicationRange {
            lowerRange
            upperRange
          }
        }
      }
    }
  }
`

export const useRepoConfig = ({ provider, owner, repo }) =>
  useQuery({
    queryKey: ['RepoConfig', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        repo,
        query,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then((res) => res?.data?.owner?.repository?.repositoryConfig || {}),
  })
