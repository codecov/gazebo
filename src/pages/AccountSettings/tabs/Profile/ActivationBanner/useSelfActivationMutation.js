import { useMutation } from '@tanstack/react-query'
import { useQueryClient as useQueryClientV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { SelfHostedCurrentUserQueryOpts } from 'services/selfHosted/SelfHostedCurrentUserQueryOpts'
import Api from 'shared/api'

export const useSelfActivationMutation = ({ queryClient, canChange }) => {
  const { provider } = useParams()
  const queryClientV5 = useQueryClientV5()

  return useMutation({
    mutationFn: (activated) => {
      if (canChange) {
        return Api.patch({
          path: '/users/current',
          body: { activated },
          provider,
        })
      }
    },
    onMutate: async (activated) => {
      await queryClientV5.cancelQueries({
        queryKey: SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
      })
      await queryClient.cancelQueries(['Seats'])

      const prevUser = queryClientV5.getQueryData(
        SelfHostedCurrentUserQueryOpts({ provider }).queryKey
      )
      const prevSeat = queryClient.getQueryData(['Seats'])

      if (canChange) {
        queryClientV5.setQueryData(
          SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
          (user) => ({
            ...user,
            activated,
          })
        )

        queryClient.setQueryData(['Seats'], (seats) => {
          const seatsUsed = seats?.data?.config?.seatsUsed

          return {
            data: {
              config: {
                ...seats?.data?.config,
                seatsUsed: activated ? seatsUsed + 1 : seatsUsed - 1,
              },
            },
          }
        })
      }

      return {
        prevUser,
        prevSeat,
      }
    },
    onError: (_err, _activated, context) => {
      queryClientV5.setQueryData(
        SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
        context.prevUser
      )
      queryClient.setQueryData(['Seats'], context.prevSeat)
    },
    onSettled: () => {
      queryClientV5.invalidateQueries({
        queryKey: SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
      })
      queryClient.invalidateQueries(['Seats'])
    },
  })
}
