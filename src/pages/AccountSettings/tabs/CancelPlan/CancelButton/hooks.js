import { useHistory, useParams } from 'react-router-dom'

import { useCancelPlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import { useBarecancel } from './useBarecancel'

export function useCancel({ customerId, isModalOpen }, options = {}) {
  const addToast = useAddNotification()
  const { provider, owner } = useParams()
  const { push } = useHistory()
  const { mutate, isLoading } = useCancelPlan({ provider, owner })
  const { baremetricsBlocked } = useBarecancel({
    customerId,
    callbackSend: cancelPlan,
    isModalOpen,
  })

  function sendUserToBilling() {
    push(`/account/${provider}/${owner}/billing`)
  }

  function cancelPlan() {
    mutate(null, {
      onSuccess: () => {
        sendUserToBilling()
      },
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
