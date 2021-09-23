import { useParams } from 'react-router-dom'
import { useInfiniteQuery } from 'react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

import { orderingOptions } from './config'

const repositoryFragment = `
  fragment RepoForList on Repository {
    name
    active
    private
    coverage
    updatedAt
    latestCommitAt
    author {
      username
    }
  }
`

function fetchMyRepos({ provider, variables, after }) {
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
    variables: { ...variables, after },
  }).then((res) => {
    const me = res?.data?.me
    return {
      repos: mapEdges(me.viewableRepositories),
      pageInfo: me?.viewableRepositories.pageInfo,
    }
  })
}

function fetchReposForOwner({ provider, variables, owner, after }) {
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
  active,
  term,
  owner,
  sortItem = orderingOptions[0],
  first = 20,
  repoNames,
}) {
  const { provider } = useParams()
  const variables = {
    filters: { active, term, repoNames },
    ordering: sortItem.ordering,
    direction: sortItem.direction,
    first,
  }

  const { data, ...rest } = useInfiniteQuery(
    ['repos', provider, variables, owner],
    ({ pageParam }) => {
      return owner
        ? fetchReposForOwner({ provider, variables, owner, after: pageParam })
        : fetchMyRepos({ provider, variables, after: pageParam })
    },
    {
      getNextPageParam: (data) =>
        data?.pageInfo?.hasNextPage ? data.pageInfo.endCursor : undefined,
    }
  )
  return {
    data: { repos: data?.pages.map((page) => page.repos).flat() },
    ...rest,
  }
}
