import { useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

import { orderingOptions } from './config'

const repositoryFragment = `
  fragment RepoForList on Repository {
    name
    active
    activated
    private
    coverage
    updatedAt
    latestCommitAt
    lines
    author {
      username
    }
    repositoryConfig {
      indicationRange {
        upperRange
        lowerRange
      }
    }
  }
`

function fetchMyRepos({ provider, variables, after, signal }) {
  const query = `
    query MyRepos($filters: RepositorySetFilters!, $ordering: RepositoryOrdering!, $direction: OrderingDirection!, $after: String) {
        me {
          viewableRepositories(filters: $filters, ordering: $ordering, orderingDirection: $direction, first: 20, after: $after) {
            edges {
              node {
                ...RepoForList
              }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
          }
        }
      }

      ${repositoryFragment}
  `

  return Api.graphql({
    provider,
    query,
    signal,
    variables: { ...variables, after },
  }).then((res) => {
    const me = res?.data?.me
    return {
      repos: mapEdges(me?.viewableRepositories),
      pageInfo: me?.viewableRepositories.pageInfo,
    }
  })
}

function fetchReposForOwner({ provider, variables, owner, after, signal }) {
  const query = `
    query ReposForOwner($filters: RepositorySetFilters!, $owner: String!, $ordering: RepositoryOrdering!, $direction: OrderingDirection!, $after: String, $first: Int) {
        owner(username: $owner) {
          repositories(filters: $filters, ordering: $ordering, orderingDirection: $direction, first: $first, after: $after) {
            edges {
              node {
                ...RepoForList
              }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
          }
        }
      }

      ${repositoryFragment}
  `

  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      ...variables,
      owner,
      after,
    },
  }).then((res) => {
    const owner = res?.data?.owner
    return {
      repos: mapEdges(owner?.repositories),
      pageInfo: owner?.repositories?.pageInfo,
    }
  })
}

export function useRepos({
  activated,
  term,
  owner,
  sortItem = orderingOptions[0],
  first = 20,
  repoNames,
  isPublic = null, // by default, get both public and private repos
  ...options
}) {
  const { provider } = useParams()
  const variables = {
    filters: { activated, term, repoNames, isPublic },
    ordering: sortItem.ordering,
    direction: sortItem.direction,
    first,
  }

  const { data, ...rest } = useInfiniteQuery(
    ['repos', provider, variables, owner],
    ({ pageParam, signal }) => {
      const data = owner
        ? fetchReposForOwner({
            provider,
            variables,
            owner,
            after: pageParam,
            signal,
          })
        : fetchMyRepos({ provider, variables, after: pageParam, signal })

      return data
    },
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
      ...options,
    }
  )
  return {
    data: { repos: data?.pages.map((page) => page.repos).flat() },
    ...rest,
  }
}
