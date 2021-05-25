import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'

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

function fetchMyRepos({ provider, variables }) {
  const query = `
    query MyRepos($filters: RepositorySetFilters!, $ordering: RepositoryOrdering!, $direction: OrderingDirection!) {
        me {
          viewableRepositories(filters: $filters, ordering: $ordering, orderingDirection: $direction) {
            edges {
              node {
                ...RepoForList
              }
            }
          }
        }
      }

      ${repositoryFragment}
  `

  return Api.graphql({ provider, query, variables }).then((res) => {
    const me = res?.data?.me
    return { repos: mapEdges(me.viewableRepositories) }
  })
}

function fetchReposForOwner({ provider, variables, owner }) {
  const query = `
    query ReposForOwner($filters: RepositorySetFilters!, $owner: String!, $ordering: RepositoryOrdering!, $direction: OrderingDirection!) {
        owner(username: $owner) {
          repositories(filters: $filters, ordering: $ordering, orderingDirection: $direction) {
            edges {
              node {
                ...RepoForList
              }
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
    },
  }).then((res) => {
    return { repos: mapEdges(res?.data?.owner?.repositories) }
  })
}

export function useRepos({
  active,
  term,
  owner,
  sortItem = orderingOptions[0],
}) {
  const { provider } = useParams()
  const variables = {
    filters: { active, term },
    ordering: sortItem.ordering,
    direction: sortItem.direction,
  }

  return useQuery(['repos', provider, variables, owner], () => {
    return owner
      ? fetchReposForOwner({ provider, variables, owner })
      : fetchMyRepos({ provider, variables })
  })
}
