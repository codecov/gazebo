import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

// Repo contents hook
function fetchRepoContents({ provider, owner, repo, branch, path, filters }) {
  const query = `
    query BranchFiles($name: String!, $repo: String!, $branch: String!, $path: String!, $filters: PathContentsFilters!) {
        owner(username:$name){
        username
        repository(name:$repo){
          branch(name:$branch){
          head {
            pathContents(path:$path, filters:$filters){
              __typename
              hits
              misses
              partials
              lines
              name
              path
              percentCovered
              ... on PathContentFile {
                isCriticalFile
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
    query,
    variables: {
      name: owner,
      repo,
      branch,
      path,
      filters,
    },
  }).then((res) => {
    return res?.data?.owner?.repository?.branch?.head?.pathContents
  })
}

export function useRepoContents({
  provider,
  owner,
  repo,
  branch,
  path,
  filters,
  ...options
}) {
  return useQuery(
    ['BranchFiles', provider, owner, repo, branch, path, filters],
    () => {
      return fetchRepoContents({ provider, owner, repo, branch, path, filters })
    },
    {
      ...options,
    }
  )
}
