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

  function sendUserToPlan() {
    push(`/plan/${provider}/${owner}`)
  }

  console.log({ baremetricsBlocked, isLoading })

  function cancelPlan() {
    mutate(null, {
      onSuccess: () => {
        console.log(
          'This thing is not being called, callback isnt being triggered from baremetrics side'
        )
        sendUserToPlan()
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
