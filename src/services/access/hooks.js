import groupBy from 'lodash/groupBy'
import { useMutation, useQuery, useQueryClient } from 'react-query'

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

export function useDeleteSession({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(
    ({ sessionid }) => {
      const query = `
    mutation DeleteSession($input: DeleteSessionInput!) {
      deleteSession(input: $input) {
        error {
          __typename
        }
      }
    }
  `
      const variables = { input: { sessionid } }

      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'deleteSession',
      }).then((res) => {
        queryClient.invalidateQueries('sessions')
      })
    },
    {
      useErrorBoundary: true,
    }
  )
}

export function useGenerateToken({ provider, opts = {} }) {
  const queryClient = useQueryClient()
  return useMutation(
    ({ name }) => {
      const query = `
      mutation($input: CreateApiTokenInput!) {
        createApiToken(input: $input) {
          error {
            __typename
          }
          fullToken
        }
      }
    `
      const variables = { input: { name } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'createApiToken',
      })
    },
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries('sessions')
      },
    }
  )
}
