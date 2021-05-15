import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

export function useRepos({ provider, active, term }) {
  const query = `
    query MyRepos($filters: RepositorySetFilters!) {
        me {
          user {
            username
          },
          viewableRepositories(filters: $filters) {
            totalCount
            edges {
              node {
                name
                active
                private
                coverage
                updatedAt
                author {
                    username
                }
              }
            }
          }
        }
      }
  `

  const variables = { filters: { active: active.text === 'Enabled', term } }

  return useQuery(['repos', provider, active, term], () => {
    return Api.graphql({ provider, query, variables }).then((res) => {
      const me = res?.data?.me
      return { repos: mapEdges(me.viewableRepositories) }
    })
  })
}
