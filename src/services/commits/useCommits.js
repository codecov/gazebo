import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

function fetchRepoCommits({ provider, owner, repo, variables, after }) {
  const CommitFragment = `
   fragment CommitFragment on Commit {
        ciPassed
        message
        commitid
        createdAt
        author{
             username
             avatarUrl
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
    query GetCommits($owner: String!, $repo: String!, $filters:CommitsSetFilters, $after: String){
        owner(username:$owner){
            repository(name: $repo){
                commits(filters: $filters, first: 20, after: $after){
                  edges{
                    node{
                       ...CommitFragment
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
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
      ...variables,
      after,
    },
  }).then((res) => {
    const commits = res?.data?.owner?.repository?.commits

    return {
      commits: mapEdges(commits),
      pageInfo: commits?.pageInfo,
    }
  })
}

export function useCommits({ provider, owner, repo, filters }) {
  const variables = {
    filters,
  }
  const { data, ...rest } = useInfiniteQuery(
    ['commits', provider, owner, repo, variables],
    ({ pageParam }) =>
      fetchRepoCommits({
        provider,
        owner,
        repo,
        variables,
        after: pageParam,
      }),
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data?.pageInfo.endCursor : undefined,
    }
  )
  return {
    data: { commits: data?.pages.map((page) => page?.commits).flat() },
    ...rest,
  }
}
