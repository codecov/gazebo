import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'

import { mapEdges } from 'shared/utils/graphql'
import Api from 'shared/api'

export function useUser(options = {}) {
  const { provider } = useParams()

  return useQuery(
    ['currentUser', provider],
    () => {
      return Api.get({
        path: '/profile',
        provider,
      })
    },
    options
  )
}

export function useMyContexts() {
  const { provider } = useParams()
  const query = `
    query MyContext {
      me {
        owner {
          username
          avatarUrl
        }
        myOrganizations {
          edges {
            node {
              username
              avatarUrl
            }
          }
        }
      }
    }
  `

  return useQuery(['myContexts', provider], () =>
    Api.graphql({ provider, query }).then((res) => {
      const me = res?.data?.me
      return me
        ? {
            currentUser: me.owner,
            myOrganizations: mapEdges(me.myOrganizations),
          }
        : null
    })
  )
}

export function useUpdateProfile({ provider }) {
  const queryClient = useQueryClient()

  return useMutation(
    (data) => {
      return Api.patch({
        path: '/profile/',
        provider,
        body: data,
      })
    },
    {
      onSuccess: (user) => {
        queryClient.setQueryData(['currentUser', provider], () => user)
      },
    }
  )
}
