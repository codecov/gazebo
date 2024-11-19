import { useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router-dom'

import { useSetPlanUpdatedNotification } from 'pages/PlanPage/context'
import { useUpgradePlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { Provider } from 'shared/api/helpers'

import { UpgradeFormFields } from '../UpgradeForm'

// This is a hook that should be used by all types of controls, as it acts as the
// layer that communicates with the backend

interface URLParams {
  provider: Provider
  owner: string
}

export const useUpgradeControls = () => {
  const { provider, owner } = useParams<URLParams>()
  const queryClient = useQueryClient()
  const history = useHistory()
  const addToast = useAddNotification()
  const { mutate } = useUpgradePlan({ provider, owner })
  const setPlanUpdatedNotification = useSetPlanUpdatedNotification()

  function upgradePlan({ seats, newPlan }: UpgradeFormFields) {
    return mutate(
      {
        seats,
        newPlan: newPlan!,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['accountDetails'])
          setPlanUpdatedNotification({
            alertOption: 'success',
          })
          history.push(`/plan/${provider}/${owner}`)
        },
        onError: (error: any) => {
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
