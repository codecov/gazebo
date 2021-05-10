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

  return useQuery(['repos', provider], () => {
    return Api.graphql({ provider, query }).then((res) => {
      const data = res?.data
      console.log('dataaa', data)
      return {
        repos: mapEdges(data.me.viewableRepositories),
      }
    })
  })
}
