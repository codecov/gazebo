import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

function fetchRepoCommits({ provider, owner, repo, filters }) {
  const CommitFragment = `
   fragment CommitFragment on Commit {
        message
        commitid
        createdAt
        author{
             username
        }
        totals{
             coverage
        }
        parent{
          totals{
            coverage
          }
        }
        compareWithParent{
            patchTotals{
                coverage
            }
        }     
    }
  `
  const query = `
    query GetCommits($owner: String!, $repo: String!, $filters:CommitsSetFilters){
        owner(username:$owner){
            repository(name: $repo){
                commits(filters: $filters){
                  edges{
                    node{
                       ...CommitFragment
                    }
                  }
             }
        }
      } 
    } 
      ${CommitFragment} 
   `

  return Api.graphql({
    provider,
    repo,
    query,
    variables: {
      owner,
      repo,
      filters: {
        ...filters,
      },
    },
  }).then((res) => {
    const { commits } = res?.data?.owner?.repository
    return mapEdges(commits)
  })
}

export function useCommits({ provider, owner, repo, filters }) {
  return useQuery([provider, owner, repo, filters, 'commits'], () => {
    return fetchRepoCommits({ provider, owner, repo, filters })
  })
}
