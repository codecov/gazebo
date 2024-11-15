import { useFlags } from 'shared/featureFlags'
import { Plans } from 'shared/utils/billing'

export function useProPlanMonth({ plans }) {
  const { enterpriseCloudPlanSupport } = useFlags({
    enterpriseCloudPlanSupport: true,
  })

  const proPlanMonth = enterpriseCloudPlanSupport
    ? plans.find(
        (plan) =>
          plan.value === Plans.USERS_PR_INAPPM ||
          plan.value === Plans.USERS_ENTERPRISEM
      )
    : plans.find((plan) => plan.value === Plans.USERS_PR_INAPPM)

  return {
    proPlanMonth,
  }
}
