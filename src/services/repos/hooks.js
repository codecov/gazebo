import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

export function useRepos({ provider }) {
  const query = `
    query MyRepos {
        me {
          user {
            username
          },
          viewableRepositories {
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

  function filterRepos(repos) {
    return {
      active: repos.filter((r) => r.active === true),
      inactive: repos.filter((r) => r.active !== true),
    }
  }

  return useQuery(['repos', provider], () => {
    return Api.graphql({ provider, query }).then((res) => {
      const me = res?.data?.me
      return filterRepos(mapEdges(me.viewableRepositories))
    })
  })
}
