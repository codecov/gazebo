import { useQuery } from 'react-query'

import Api from 'shared/api'

function fetchRepoContents({ provider, owner, repo, branch, path }) {
  const query = `
    query BranchFiles($name: String!, $repo: String!, $branch: String!, $path: String!) {
        owner(username:$name){
        username
        repository(name:$repo){
          branch(name:$branch){
          head {
            pathContents(path:$path){
              name
              filePath
              percentCovered
              type
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
      path,
    },
  }).then((res) => {
    return res?.data?.owner?.repository?.branch?.head?.pathContents
  })
}

export function useRepoContents({ provider, owner, repo, branch, path }) {
  return useQuery([provider, owner, repo, branch, path, 'BranchFiles'], () => {
    return fetchRepoContents({ provider, owner, repo, branch, path })
  })
}
