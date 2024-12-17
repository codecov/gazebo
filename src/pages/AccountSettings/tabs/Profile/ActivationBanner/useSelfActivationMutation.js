import { useMutation } from '@tanstack/react-query'
import { useQueryClient as useQueryClientV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { SelfHostedSeatsConfigQueryOpts } from 'services/selfHosted/SelfHostedSeatsConfigQueryOpts'
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
      await queryClient.cancelQueries(['SelfHostedCurrentUser'])
      await queryClientV5.cancelQueries({
        queryKey: SelfHostedSeatsConfigQueryOpts({ provider }).queryKey,
      })

      const prevUser = queryClient.getQueryData(['SelfHostedCurrentUser'])
      const prevSeat = queryClientV5.getQueryData(
        SelfHostedSeatsConfigQueryOpts({ provider }).queryKey
      )

      if (canChange) {
        queryClient.setQueryData(['SelfHostedCurrentUser'], (user) => ({
          ...user,
          activated,
        }))

        queryClientV5.setQueryData(
          SelfHostedSeatsConfigQueryOpts({ provider }).queryKey,
          (seats) => {
            const seatsUsed = seats?.data?.config?.seatsUsed
            return {
              data: {
                config: {
                  ...seats?.data?.config,
                  seatsUsed: activated ? seatsUsed + 1 : seatsUsed - 1,
                },
              },
            }
          }
        )
      }

      return { prevUser, prevSeat }
    },
    onError: (_err, _activated, context) => {
      queryClient.setQueryData(['SelfHostedCurrentUser'], context.prevUser)
      queryClientV5.setQueryData(
        SelfHostedSeatsConfigQueryOpts({ provider }).queryKey,
        context.prevSeat
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries(['SelfHostedCurrentUser'])
      queryClientV5.invalidateQueries(
        SelfHostedSeatsConfigQueryOpts({ provider }).queryKey
      )
    },
  })
}
