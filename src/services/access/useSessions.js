import { useQuery } from '@tanstack/react-query'
import groupBy from 'lodash/groupBy'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

export function useSessions({ provider }) {
  const query = `
    query MySessions {
        me {
          sessions {
            edges {
              node{
                sessionid
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

  return useQuery(['sessions', provider], () => {
    return Api.graphql({ provider, query }).then((res) => {
      const me = res?.data?.me
      if (!me) return null
      const data = groupBy(mapEdges(me.sessions), 'type')
      return {
        sessions: data.login || [],
        tokens: data.api || [],
      }
    })
  })
}
