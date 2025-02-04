import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useSetPlanUpdatedNotification } from 'pages/PlanPage/context'
import Api from 'shared/api'
import { Plans } from 'shared/utils/billing'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

function cancelPlan({ provider, owner, planType }) {
  const path = getPathAccountDetails({ provider, owner })
  const body = {
    plan: {
      value: planType,
    },
  }
  return Api.patch({ path, provider, body })
}

export function useCancelPlan({ provider, owner }) {
  const queryClient = useQueryClient()
  const planType = Plans.USERS_DEVELOPER
  const setPlanUpdatedNotification = useSetPlanUpdatedNotification()

  return useMutation({
    mutationFn: () => cancelPlan({ provider, owner, planType }),
    onSuccess: (data) => {
      // update the local cache of account details from what the server returns
      queryClient.setQueryData(['accountDetails', provider, owner], data)
      setPlanUpdatedNotification({
        alertOption: 'info',
        isCancellation: true,
      })
    },
  })
}
