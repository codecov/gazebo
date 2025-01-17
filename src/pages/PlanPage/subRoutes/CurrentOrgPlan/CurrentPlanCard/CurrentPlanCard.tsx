import { useParams } from 'react-router-dom'

import { useAccountDetails, usePlanData } from 'services/account'
import { Provider } from 'shared/api/helpers'
import { CollectionMethods } from 'shared/utils/billing'

import EnterprisePlanCard from './EnterprisePlanCard'
import FreePlanCard from './FreePlanCard'
import PaidPlanCard from './PaidPlanCard'

interface URLParams {
  provider: Provider
  owner: string
}

function CurrentPlanCard() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const collectionMethod = accountDetails?.subscriptionDetail?.collectionMethod

  if (planData?.plan?.isFreePlan || planData?.plan?.isTrialPlan) {
    return (
      <FreePlanCard plan={planData?.plan} scheduledPhase={scheduledPhase} />
    )
  }

  if (
    planData?.plan?.isEnterprisePlan ||
    collectionMethod === CollectionMethods.INVOICED_CUSTOMER_METHOD ||
    accountDetails?.usesInvoice
  ) {
    return <EnterprisePlanCard plan={planData?.plan} />
  }

  return <PaidPlanCard />
}

export default CurrentPlanCard
