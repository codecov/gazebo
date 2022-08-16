import { useFlags } from 'shared/featureFlags'

export function useProPlanMonth({ plans }) {
  const { enterpriseCloudPlanSupport } = useFlags({
    enterpriseCloudPlanSupport: true,
  })

  const proPlanMonth = enterpriseCloudPlanSupport
    ? plans.find(
        (plan) =>
          plan.value === 'users-pr-inappm' || plan.value === 'users-enterprisem'
      )
    : plans.find((plan) => plan.value === 'users-pr-inappm')

  return {
    proPlanMonth,
  }
}
