import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchRepoBranchCoverage({ provider, owner, repo, branch, signal }) {
  const query = `
    query GetRepoCoverage($name: String!, $repo: String!, $branch: String!) {
      owner(username:$name){
        repository: repositoryDeprecated(name:$repo){
          branch(name:$branch) {
            name
            head {
              yamlState
              totals {
                percentCovered
                lineCount
                hitsCount
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
      branch,
    },
  }).then((res) => res?.data?.owner?.repository?.branch || {})
}

export function useRepoCoverage({
  provider,
  owner,
  repo,
  branch,
  options = {},
}) {
  return useQuery({
    queryKey: ['coverage', provider, owner, repo, branch],
    queryFn: ({ signal }) =>
      fetchRepoBranchCoverage({ provider, owner, repo, branch, signal }),
    ...options,
  })
}
