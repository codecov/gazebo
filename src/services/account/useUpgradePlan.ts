import { useStripe } from '@stripe/react-stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'
import { Plan } from 'shared/utils/billing'

interface useUpgradePlanParams {
  provider: string
  owner: string
}

function getPathAccountDetails({ provider, owner }: useUpgradePlanParams) {
  return `/${provider}/${owner}/account-details/`
}

export function useUpgradePlan({ provider, owner }: useUpgradePlanParams) {
  const stripe = useStripe()
  const queryClient = useQueryClient()

  function redirectToStripe(sessionId: string) {
    return stripe!.redirectToCheckout({ sessionId }).then((e) => {
      // error from Stripe SDK
      return Promise.reject(new Error(e.error.message))
    })
  }

  return useMutation({
    mutationFn: (formData: { seats: number; newPlan: Plan }) => {
      const path = getPathAccountDetails({ provider, owner })
      const body = {
        plan: {
          quantity: formData?.seats,
          value: formData?.newPlan.value,
        },
      }
      return Api.patch({ path, provider, body }).then((data) => {
        if (data?.checkoutSessionId) {
          // redirect to stripe checkout if there is a checkout session id
          return redirectToStripe(data.checkoutSessionId)
        }

        return data
      })
    },
    onSuccess: (data) => {
      // update the local cache of account details from what the server returns
      queryClient.setQueryData(['accountDetails', provider, owner], data)
    },
  })
}
