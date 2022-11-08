import { useStripe } from '@stripe/react-stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

export function useUpdateCard({ provider, owner }) {
  const stripe = useStripe()
  const queryClient = useQueryClient()

  return useMutation(
    (card) => {
      return stripe
        .createPaymentMethod({
          type: 'card',
          card,
        })
        .then((result) => {
          if (result.error) return Promise.reject(result.error)

          const accountPath = getPathAccountDetails({ provider, owner })
          const path = `${accountPath}update_payment`

          return Api.patch({
            provider,
            path,
            body: {
              /* eslint-disable camelcase */
              payment_method: result.paymentMethod.id,
              /* eslint-enable camelcase */
            },
          })
        })
    },
    {
      onSuccess: (data) => {
        // update the local cache of account details from what the server returns
        queryClient.setQueryData(['accountDetails', provider, owner], data)
      },
    }
  )
}
