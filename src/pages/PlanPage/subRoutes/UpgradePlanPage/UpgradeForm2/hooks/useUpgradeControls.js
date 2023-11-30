import { useHistory, useParams } from 'react-router-dom'

import { useUpgradePlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

// This is a hook that should be used by all types of controls, as it acts as the
// layer that communicates with the backend
export const useUpgradeControls = () => {
  const { provider, owner } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()
  const { mutate } = useUpgradePlan({ provider, owner })

  function upgradePlan({ seats, newPlan }) {
    return mutate(
      {
        seats,
        newPlan,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            text: 'Plan successfully upgraded',
          })
          history.push(`/plan/${provider}/${owner}`)
        },
        onError: (error) => {
          addToast({
            type: 'error',
            text: error?.data?.detail || 'Something went wrong',
          })
        },
      }
    )
  }

  return {
    upgradePlan,
  }
}
