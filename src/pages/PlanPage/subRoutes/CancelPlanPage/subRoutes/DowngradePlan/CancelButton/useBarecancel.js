import { useCallback, useEffect, useState } from 'react'

import config from 'config'

import { loadBaremetrics } from './utils'

export function useBarecancel({ customerId, callbackSend, isModalOpen }) {
  const memoizedSuccess = useCallback(callbackSend, [callbackSend])
  const [wasBlocked, setWasBlocked] = useState(!window?.barecancel?.params)

  useEffect(() => {
    let unMounted = false
    if (isModalOpen) {
      loadBaremetrics()
        .then(() => {
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
          if (unMounted) return
          setWasBlocked(false)
        })
        .catch(() => {
          setWasBlocked(true)
        })
    }

    return () => {
      unMounted = true
    }
  }, [customerId, memoizedSuccess, setWasBlocked, isModalOpen])

  return { baremetricsBlocked: wasBlocked }
}
