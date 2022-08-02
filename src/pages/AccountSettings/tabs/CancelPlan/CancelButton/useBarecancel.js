import { useCallback, useEffect, useState } from 'react'

import config from 'config'

import { cleanupBaremetrics, loadBaremetrics } from './utils'

export function useBarecancel({ customerId, callbackSend }) {
  const memoizedSuccess = useCallback(callbackSend, [callbackSend])
  console.log(memoizedSuccess)
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
