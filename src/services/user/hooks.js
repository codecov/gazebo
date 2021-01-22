import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'

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
