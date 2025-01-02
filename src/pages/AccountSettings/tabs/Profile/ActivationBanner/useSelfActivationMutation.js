import {
  useMutation as useMutationV5,
  useQueryClient as useQueryClientV5,
} from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { SelfHostedCurrentUserQueryOpts } from 'services/selfHosted/SelfHostedCurrentUserQueryOpts'
import { SelfHostedSeatsConfigQueryOpts } from 'services/selfHosted/SelfHostedSeatsConfigQueryOpts'
import Api from 'shared/api'

export const useSelfActivationMutation = ({ canChange }) => {
  const { provider } = useParams()
  const queryClientV5 = useQueryClientV5()

  return useMutationV5({
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
      // Cancel any in-flight queries
      await queryClientV5.cancelQueries({
        queryKey: SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
      })
      await queryClientV5.cancelQueries({
        queryKey: SelfHostedSeatsConfigQueryOpts({ provider }).queryKey,
      })

      // Get the current data before the mutation
      const prevSeat = queryClientV5.getQueryData(
        SelfHostedSeatsConfigQueryOpts({ provider }).queryKey
      )
      const prevUser = queryClientV5.getQueryData(
        SelfHostedCurrentUserQueryOpts({ provider }).queryKey
      )

      if (canChange) {
        // Optimistically update the data in the query client
        queryClientV5.setQueryData(
          SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
          (user) => ({ ...user, activated })
        )

        queryClientV5.setQueryData(
          SelfHostedSeatsConfigQueryOpts({ provider }).queryKey,
          (seats) => {
            const seatsUsed = activated
              ? seats?.data?.config?.seatsUsed + 1
              : seats?.data?.config?.seatsUsed - 1

            return { data: { config: { ...seats?.data?.config, seatsUsed } } }
          }
        )
      }

      return { prevUser, prevSeat }
    },
    onError: (_err, _activated, context) => {
      // Rollback the data if the mutation fails
      queryClientV5.setQueryData(
        SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
        context.prevUser
      )
      queryClientV5.setQueryData(
        SelfHostedSeatsConfigQueryOpts({ provider }).queryKey,
        context.prevSeat
      )
    },
    onSettled: () => {
      // Invalidate the queries to ensure they are re-fetched
      queryClientV5.invalidateQueries({
        queryKey: SelfHostedCurrentUserQueryOpts({ provider }).queryKey,
      })
      queryClientV5.invalidateQueries(
        SelfHostedSeatsConfigQueryOpts({ provider }).queryKey
      )
    },
  })
}
