import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import {
  CollectionMethods,
  isEnterprisePlan,
  isFreePlan,
  isTrialPlan,
} from 'shared/utils/billing'

import EnterprisePlanCard from './EnterprisePlanCard'
import FreePlanCard from './FreePlanCard'
import PaidPlanCard from './PaidPlanCard'

function CurrentPlanCard() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const collectionMethod = accountDetails?.subscriptionDetail?.collectionMethod

  if (isFreePlan(plan?.value) || isTrialPlan(plan?.value)) {
    return <FreePlanCard plan={plan} scheduledPhase={scheduledPhase} />
  }

  if (
    isEnterprisePlan(plan?.value) ||
    collectionMethod === CollectionMethods.INVOICED_CUSTOMER_METHOD
  ) {
    return <EnterprisePlanCard plan={plan} />
  }

  return <PaidPlanCard />
}

export default CurrentPlanCard
