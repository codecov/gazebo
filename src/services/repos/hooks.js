import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

const repositoryFragment = `
  fragment RepoForList on Repository {
    name
    active
    private
    coverage
    updatedAt
    author {
      username
    }
  }
`

function fetchMyRepos({ provider, variables }) {
  const query = `
    query MyRepos($filters: RepositorySetFilters!) {
        me {
          viewableRepositories(filters: $filters) {
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

export function useRepos({ active, term }) {
  const { provider } = useParams()
  const variables = { filters: { active, term } }

  const keys = ['repos', provider, variables]

  return useQuery(keys, () => fetchMyRepos({ provider, variables }))
}
