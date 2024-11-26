import { useFlags } from 'shared/featureFlags'
import { Plans } from 'shared/utils/billing'

export function useEnterpriseCloudPlanSupport({ plans }) {
  const { enterpriseCloudPlanSupport } = useFlags({
    enterpriseCloudPlanSupport: true,
  })

  const enterprisePlans = [Plans.USERS_ENTERPRISEM, Plans.USERS_ENTERPRISEY]

  if (enterpriseCloudPlanSupport) {
    plans.push(...enterprisePlans)
  }

  return { plans }
}
