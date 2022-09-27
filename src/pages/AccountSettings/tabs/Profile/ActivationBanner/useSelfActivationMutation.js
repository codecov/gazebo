import { useMutation } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfActivationMutation = ({ queryClient, canChange }) =>
  useMutation(
    (activated) => {
      if (canChange) {
        return Api.patch({
          path: '/users/current',
          body: { activated },
        })
      }
    },
    {
      onMutate: async (activated) => {
        await queryClient.cancelQueries(['SelfHostedCurrentUser'])
        await queryClient.cancelQueries(['Seats'])

        const prevUser = queryClient.getQueryData(['SelfHostedCurrentUser'])
        const prevSeat = queryClient.getQueryData(['Seats'])

        if (canChange) {
          queryClient.setQueryData(['SelfHostedCurrentUser'], (user) => ({
            ...user,
            activated,
          }))

          queryClient.setQueryData(['Seats'], (seats) => {
            const seatsUsed = seats?.data?.config?.seatsUsed

            return {
              data: {
                config: {
                  ...seats.data.config,
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
        queryClient.setQueryData(['SelfHostedCurrentUser'], context.prevUser)
        queryClient.setQueryData(['Seats'], context.prevSeat)
      },
      onSettled: () => {
        queryClient.invalidateQueries(['SelfHostedCurrentUser'])
        queryClient.invalidateQueries(['Seats'])
      },
    }
  )
