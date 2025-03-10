import { useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router-dom'

import { useSetPlanUpdatedNotification } from 'pages/PlanPage/context'
import { useUpgradePlan } from 'services/account/useUpgradePlan'
import { useAddNotification } from 'services/toastNotification/context'
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
        onSuccess: async () => {
          // we want to wait here as history.push can disrupt the query invalidation
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['accountDetails'] }),
            queryClient.refetchQueries({ queryKey: ['GetPlanData'] }),
          ])
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
