import Api from 'shared/api'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'
import _ from 'lodash'

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
      const data = _.groupBy(mapEdges(me.sessions), 'type')
      return me
        ? {
            sessions: data.login || [],
            tokens: data.api || [],
          }
        : null
    })
  })
}

export function useDeleteSession({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(({ sessionid }) => {
    const query = `
    mutation {
        deleteSession(input: { sessionid: ${sessionid}}) {
          error
        }
      }
  `
    return Api.graphql({ provider, query }).then((res) => {
      queryClient.invalidateQueries('sessions')
      return res?.data?.deleteSession?.error
    })
  })
}

export function useGenerateToken({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(({ name }) => {
    const query = `
      mutation {
        createApiToken(input: { name: ${name}}) {
            error
          }
        }
    `
    return Api.graphql({ provider, query }).then((res) => {
      queryClient.invalidateQueries('sessions')
      return res?.data?.deleteSession?.error
    })
  })
}
