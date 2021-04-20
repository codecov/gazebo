import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

export function useSessions({ provider, owner }) {
  const query = `
    query MySessions {
        me {
          sessions {
            edges {
              node{
                name
                ip
                lastseen
                useragent
                type
                lastFour
              }
            }
          }
        }
      }
  `

  return useQuery(['sessions', provider, owner], () => {
    return Api.graphql({ provider, query }).then((res) => {
      const me = res?.data?.me
      return me
        ? {
            sessions: mapEdges(me.sessions),
          }
        : null
    })
  })
}
