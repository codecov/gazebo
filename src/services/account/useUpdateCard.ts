import { useStripe } from '@stripe/react-stripe-js'
import { StripeCardElement } from '@stripe/stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

interface useUpdateCardParams {
  provider: string
  owner: string
}

interface useUpdateCardReturn {
  reset: () => void
  error: null | Error
  isLoading: boolean
  mutate: (variables: any, data: any) => void
  data: undefined | unknown
}

function getPathAccountDetails({ provider, owner }: useUpdateCardParams) {
  return `/${provider}/${owner}/account-details/`
}

export function useUpdateCard({
  provider,
  owner,
}: useUpdateCardParams): useUpdateCardReturn {
  const stripe = useStripe()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (card: StripeCardElement) => {
      return stripe!
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
              /* eslint-disable-next-line camelcase */
              payment_method: result.paymentMethod.id,
            },
          })
        })
    },
    onSuccess: (data) => {
      // update the local cache of account details from what the server returns
      queryClient.setQueryData(['accountDetails', provider, owner], data)
    },
  })
}
