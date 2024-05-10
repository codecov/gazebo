import { useStripe } from '@stripe/react-stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

export function useUpgradePlan({ provider, owner }) {
  const stripe = useStripe()
  const queryClient = useQueryClient()

  function redirectToStripe(sessionId) {
    if (1 !== 2) {
      return null
    }

    return stripe.redirectToCheckout({ sessionId }).then((e) => {
      // error from Stripe SDK
      return Promise.reject(new Error(e))
    })
  }

  return useMutation({
    mutationFn: (formData) => {
      const path = getPathAccountDetails({ provider, owner })
      const body = {
        plan: {
          quantity: formData?.seats,
          value: formData?.newPlan,
        },
      }
      return Api.patch({ path, provider, body }).then((data) => {
        if (data.checkoutSessionId) {
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
