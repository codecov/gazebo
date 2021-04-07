import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useStripe } from '@stripe/react-stripe-js'
import * as Cookie from 'js-cookie'

import Api from 'shared/api'
import { ProviderCookieKeyMapping } from 'shared/api/helpers'

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

export function useInvoices({ provider, owner }) {
  return useQuery(['invoices', provider, owner], () => {
    const path = `/${provider}/${owner}/invoices/`
    return Api.get({ path, provider })
  })
}

export function useInvoice({ provider, owner, id }) {
  return useQuery(['invoice', provider, owner, id], () => {
    const path = `/${provider}/${owner}/invoices/${id}`
    return Api.get({ path, provider })
  })
}

export function useAccountDetails({ provider, owner, opts = {} }) {
  return useQuery(
    ['accountDetails', provider, owner],
    () => {
      return fetchAccountDetails({ provider, owner })
    },
    opts
  )
}

export function usePlans(provider) {
  // the plans are very static data
  return useQuery('plans', () => fetchPlan(provider), {
    cacheTime: Infinity,
    staleTime: Infinity,
  })
}

export function useCancelPlan({ provider, owner }) {
  const queryClient = useQueryClient()

  return useMutation(() => cancelPlan({ provider, owner }), {
    onSuccess: (data) => {
      // update the local cache of account details from what the server returns
      queryClient.setQueryData(['accountDetails', provider, owner], data)
    },
  })
}

export function useUpgradePlan({ provider, owner }) {
  const stripe = useStripe()
  const queryClient = useQueryClient()

  function redirectToStripe(sessionId) {
    return stripe.redirectToCheckout({ sessionId }).then((e) => {
      // error from Stripe SDK
      return Promise.reject(new Error(e))
    })
  }

  return useMutation(
    (formData) => {
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
    },
    {
      onSuccess: (data) => {
        // update the local cache of account details from what the server returns
        queryClient.setQueryData(['accountDetails', provider, owner], data)
      },
    }
  )
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

export function useEraseAccount({ provider, owner }) {
  return useMutation(
    () => {
      const path = getPathAccountDetails({ provider, owner })

      return Api.delete({
        provider,
        path,
      })
    },
    {
      onSuccess: () => {
        // clear cookie and redirect to homepage
        const cookieTokenName = ProviderCookieKeyMapping[provider]
        Cookie.remove(cookieTokenName)
        window.location.href = '/'
      },
    }
  )
}

export function useAutoActivate({ provider, owner, opts = {} }) {
  const queryClient = useQueryClient()
  const { onSuccess, ...passedOpts } = opts

  const successHandler = (...args) => {
    // The following cache busts will trigger react-query to retry the api call updating components depending on this data.
    queryClient.invalidateQueries('users')
    queryClient.invalidateQueries('accountDetails')

    if (onSuccess) {
      // Exicute passed onSuccess after invalidating queries
      onSuccess.apply(null, args)
    }
  }

  return useMutation(
    (activate) => {
      const path = getPathAccountDetails({ provider, owner })
      const body = {
        /* eslint-disable camelcase */
        plan_auto_activate: activate,
        /* eslint-enable camelcase */
      }

      return Api.patch({
        path,
        provider,
        body,
      })
    },
    { onSuccess: successHandler, ...passedOpts }
  )
}
