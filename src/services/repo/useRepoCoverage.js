import { useQuery } from 'react-query'

import Api from 'shared/api'

function fetchRepoBranchCoverage({ provider, owner, repo, branch }) {
  const query = `
    query GetRepoCoverage($name: String!, $repo: String!, $branch: String!) {
      owner(username:$name){
        repository(name:$repo){
          branch(name:$branch) {
            name
            head {
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
    variables: {
      name: owner,
      repo,
      branch,
    },
  }).then((res) => res?.data?.owner?.repository?.branch || {})
}

export function useRepoCoverage({ provider, owner, repo, branch }) {
  return useQuery(['coverage', provider, owner, repo, branch], () => {
    return fetchRepoBranchCoverage({ provider, owner, repo, branch })
  })
}
