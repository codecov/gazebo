import { useFlags } from 'shared/featureFlags'

export function useProPlans({ plans }) {
  const { enterpriseCloudPlanSupport } = useFlags({
    enterpriseCloudPlanSupport: true,
  })

  const proPlanMonth = enterpriseCloudPlanSupport
    ? plans.find(
        (plan) =>
          plan.value === 'users-pr-inappm' || plan.value === 'users-enterprisem'
      )
    : plans.find((plan) => plan.value === 'users-pr-inappm')

  const proPlanYear = enterpriseCloudPlanSupport
    ? plans.find(
        (plan) =>
          plan.value === 'users-pr-inappy' || plan.value === 'users-enterprisey'
      )
    : plans.find((plan) => plan.value === 'users-pr-inappy')

  return {
    proPlanMonth,
    proPlanYear,
  }
}
