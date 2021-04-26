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
      if (!me) return null
      const data = _.groupBy(mapEdges(me.sessions), 'type')
      return {
        sessions: data.login || [],
        tokens: data.api || [],
      }
    })
  })
}

export function useDeleteSession({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(({ sessionid }) => {
    const query = `
    mutation($input: DeleteSessionInput!) {
        deleteSession(input: $input) {
          error
        }
      }
  `
    const variables = { input: { sessionid } }

    return Api.graphql({ provider, query, variables }).then((res) => {
      queryClient.invalidateQueries('sessions')
      return res?.data?.deleteSession?.error
    })
  })
}

export function useGenerateToken({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(({ name }) => {
    const query = `
    mutation($input: CreateApiTokenInput!) {
        createApiToken(input: $input) {
          error
        }
      }
    `
    const variables = { input: { name } }
    return Api.graphql({ provider, query, variables }).then((res) => {
      queryClient.invalidateQueries('sessions')
      return res?.data?.deleteSession?.error
    })
  })
}
