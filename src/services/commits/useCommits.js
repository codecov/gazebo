import { useInfiniteQuery } from '@tanstack/react-query'
import isNumber from 'lodash/isNumber'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

function fetchRepoCommits({ provider, owner, repo, variables, after, signal }) {
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
          __typename
          ... on Comparison {
            patchTotals{
                coverage
            }
          }
          ... on FirstPullRequest {
            message
          }
          ... on MissingBaseCommit {
            message
          }
          ... on MissingHeadCommit {
            message
          }
          ... on MissingComparison {
            message
          }
          ... on MissingBaseReport {
            message
          }
          ... on MissingHeadReport {
            message
          }
        }
    }
  `
  const query = `
  query GetCommits(
    $owner: String!
    $repo: String!
    $filters: CommitsSetFilters
    $after: String
    $includeTotalCount: Boolean!
  ) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        commits(filters: $filters, first: 20, after: $after) {
          totalCount @include(if: $includeTotalCount)
          edges {
            node {
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
  ${CommitFragment}`

  return Api.graphql({
    provider,
    repo,
    query,
    signal,
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
      commitsCount: commits?.totalCount,
      pageInfo: commits?.pageInfo,
    }
  })
}

export function useCommits({ provider, owner, repo, filters, opts = {} }) {
  const variables = {
    filters,
    includeTotalCount: isNumber(filters?.pullId),
  }
  const { data, ...rest } = useInfiniteQuery(
    ['commits', provider, owner, repo, variables],
    ({ pageParam, signal }) =>
      fetchRepoCommits({
        provider,
        owner,
        repo,
        variables,
        after: pageParam,
        signal,
      }),
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data?.pageInfo.endCursor : undefined,
      ...opts,
    }
  )
  return {
    data: {
      commits: data?.pages.map((page) => page?.commits).flat(),
      commitsCount: data?.pages[0]?.commitsCount,
    },
    ...rest,
  }
}
