import { useElements, useStripe } from '@stripe/react-stripe-js'
import { Address, StripePaymentElement } from '@stripe/stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import config from 'config'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'

import { useCreateStripeSetupIntent } from './useCreateStripeSetupIntent'

interface useUpdatePaymentMethodProps {
  provider: Provider
  owner: string
  name?: string
  email?: string
  address?: Address
}

interface useUpdatePaymentMethodReturn {
  reset: () => void
  error: null | Error
  isLoading: boolean
  mutate: (
    variables: StripePaymentElement | null,
    data?: { onSuccess?: () => void }
  ) => void
  data: undefined | unknown
}

function getPathAccountDetails({
  provider,
  owner,
}: {
  provider: Provider
  owner: string
}) {
  return `/${provider}/${owner}/account-details/`
}

export function useUpdatePaymentMethod({
  provider,
  owner,
  name,
  email,
  address,
}: useUpdatePaymentMethodProps): useUpdatePaymentMethodReturn {
  const stripe = useStripe()
  const elements = useElements()
  const queryClient = useQueryClient()
  const { data: setupIntent } = useCreateStripeSetupIntent({ owner, provider })

  return useMutation({
    mutationFn: () => {
      const clientSecret = setupIntent?.clientSecret
      if (!clientSecret) {
        throw new Error('Client secret not found')
      }

      return stripe!
        .confirmSetup({
          clientSecret,
          elements: elements!,
          redirect: 'if_required',
          confirmParams: {
            // eslint-disable-next-line camelcase
            payment_method_data: {
              // eslint-disable-next-line camelcase
              billing_details: { name, email, address },
            },
            // eslint-disable-next-line camelcase
            return_url: `${config.BASE_URL}/plan/${provider}/${owner}`,
          },
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
              payment_method: result.setupIntent.payment_method,
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
