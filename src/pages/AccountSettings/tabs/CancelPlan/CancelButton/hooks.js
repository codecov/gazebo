import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useCancelPlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import { cleanupBaremetrics, loadBaremetrics } from './utils'

export function useBarecancel({ customerId, callbackSend }) {
  const memoizedSuccess = useCallback(callbackSend, [callbackSend])
  const [wasBlocked, setWasBlocked] = useState(!window?.barecancel?.params)

  useEffect(() => {
    const configureBarecancel = () => {
      window.barecancel.params = {
        /* eslint-disable camelcase */
        access_token_id: config.BAREMETRICS_TOKEN,
        customer_oid: customerId,
        comment_required: true,
        callback_send: () => {
          memoizedSuccess()
        },
        callback_error: (error) => {
          // You can also catch any errors that happen when sending the cancellation event to Baremetrics.
          // For example, if Baremetrics returns that the customer does not have an active subscription.
          console.error(error)
        },
        /* eslint-enable camelcase */
      }
      setWasBlocked(false)
    }
    loadBaremetrics().then(configureBarecancel)
    return () => cleanupBaremetrics()
  }, [customerId, memoizedSuccess, setWasBlocked])

  return { baremetricsBlocked: wasBlocked }
}

export function useCancel({ customerId }, options = {}) {
  const addToast = useAddNotification()
  const { provider, owner } = useParams()
  const { mutate, isLoading } = useCancelPlan({ provider, owner })
  const { baremetricsBlocked } = useBarecancel({
    customerId,
    callbackSend: cancelPlan,
  })

  function cancelPlan() {
    mutate(null, {
      onError: () =>
        addToast({
          type: 'error',
          text: 'Something went wrong, we were unable to cancel your plan. Please reach out to support.',
        }),
      ...options,
    })
  }

  return {
    cancelPlan,
    baremetricsBlocked,
    queryIsLoading: isLoading,
  }
}
