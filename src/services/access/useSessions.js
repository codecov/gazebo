import { useQuery } from '@tanstack/react-query'

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
          tokens {
            edges {
              node {
                type
                name
                lastFour
                id
              }
            }
          }
        }
      }
  `

  return useQuery(['sessions', provider], ({ signal }) => {
    return Api.graphql({ provider, query, signal }).then((res) => {
      const me = res?.data?.me
      if (!me) return null
      return {
        sessions: mapEdges(me?.sessions) || [],
        tokens: mapEdges(me?.tokens) || [],
      }
    })
  })
}
