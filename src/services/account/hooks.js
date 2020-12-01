import { useMemo } from 'react'
import { useQuery, useMutation } from 'react-query'

import config from 'config'
import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({ provider, owner }) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider })
}

function fetchPlan(provider) {
  const path = `/plans`
  return Api.get({ path, provider })
}

function cancelPlan({ provider, owner }) {
  const path = getPathAccountDetails({ provider, owner })
  const body = {
    plan: {
      value: 'users-free',
    },
  }
  return Api.patch({ path, provider, body })
}

export function useAccountDetails({ provider, owner }) {
  return useQuery(['accountDetails', provider, owner], (_, provider, owner) => {
    return fetchAccountDetails({ provider, owner })
  })
}

export function useAccountsAndPlans({ provider, owner }) {
  return useQuery(
    ['accountDetails-and-plans', provider, owner],
    (_, provider, owner) => {
      return Promise.all([
        fetchAccountDetails({ provider, owner }),
        fetchPlan(provider),
      ]).then((data) => {
        const [accountDetails, plans] = data
        return { accountDetails, plans }
      })
    }
  )
}

export function useCancelPlan({ provider, owner, ...rest }) {
  return useMutation(() => cancelPlan({ provider, owner }), rest)
}

export function useUpgradePlan({ provider, owner, ...rest }) {
  const stripe = useMemo(() => {
    return window['Stripe'](config.STRIPE_KEY)
  }, [])

  function redirectToStripe(sessionId) {
    return stripe.redirectToCheckout({ sessionId }).then((e) => {
      // error from Stripe SDK
      throw new Error(e)
    })
  }

  return useMutation((formData) => {
    const path = getPathAccountDetails({ provider, owner })
    const body = {
      plan: {
        quantity: formData.seats,
        value: formData.newPlan.value,
      },
    }
    return Api.patch({ path, provider, body }).then((data) => {
      if (data.checkoutSessionId) {
        // redirect to stripe checkout if there is a checkout session id
        return redirectToStripe(data.checkoutSessionId)
      }

      return data
    })
  }, rest)
}
