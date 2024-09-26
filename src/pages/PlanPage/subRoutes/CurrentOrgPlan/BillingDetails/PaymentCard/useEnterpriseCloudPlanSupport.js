const { useFlags } = require('shared/featureFlags')

export function useEnterpriseCloudPlanSupport({ plans }) {
  const { enterpriseCloudPlanSupport } = useFlags({
    enterpriseCloudPlanSupport: true,
  })

  const enterprisePlans = ['users-enterprisem', 'users-enterprisey']

  if (enterpriseCloudPlanSupport) {
    plans.push(...enterprisePlans)
  }

  return { plans }
}
