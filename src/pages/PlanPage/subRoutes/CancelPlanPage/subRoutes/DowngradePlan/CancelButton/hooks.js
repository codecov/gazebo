import { useHistory, useParams } from 'react-router-dom'

import { useCancelPlan } from 'services/account/useCancelPlan'
import { useAddNotification } from 'services/toastNotification/context'

export function useCancel(options = {}) {
  const addToast = useAddNotification()
  const { provider, owner } = useParams()
  const { push } = useHistory()
  const { mutate, isLoading } = useCancelPlan({ provider, owner })

  function sendUserToPlan() {
    push(`/plan/${provider}/${owner}`)
  }

  function cancelPlan() {
    mutate(null, {
      onSuccess: () => {
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
    queryIsLoading: isLoading,
  }
}
