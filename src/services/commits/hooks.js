import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

function fetchRepoCommits({ provider, owner, repo, filter }) {
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
        compareWithParent{
            patchTotals{
                coverage
            }
        }     
    }
  `
  const query = `
    query GetCommits($owner: String!, $repo: String!, $filter:CommitsSetFilters){
        owner(username:$owner){
            repository(name: $repo){
                commits(filters: $filter){
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
      filter: {
        hasUploadedCoverage: filter,
      },
    },
  }).then((res) => {
    const { commits } = res?.data?.owner?.repository
    return mapEdges(commits)
  })
}

export function useCommits({ provider, owner, repo, filter = false }) {
  return useQuery([provider, owner, repo, filter, 'commits'], () => {
    return fetchRepoCommits({ provider, owner, repo, filter })
  })
}
