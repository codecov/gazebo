import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'
import { useFlags } from 'shared/featureFlags'
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
  const { planCancelationFlow } = useFlags({ planCancelationFlow: false })
  const planType = planCancelationFlow ? Plans.USERS_BASIC : Plans.USERS_FREE

  return useMutation(() => cancelPlan({ provider, owner, planType }), {
    onSuccess: (data) => {
      // update the local cache of account details from what the server returns
      queryClient.setQueryData(['accountDetails', provider, owner], data)
    },
  })
}
