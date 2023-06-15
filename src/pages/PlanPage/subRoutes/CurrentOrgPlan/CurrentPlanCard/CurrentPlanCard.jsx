import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { usePlanPageData } from 'pages/PlanPage/hooks'
import { accountDetailsPropType, usePlans } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import { isBasicPlan, isFreePlan, useProPlans } from 'shared/utils/billing'

import ActionsBilling from './ActionsBilling'
import HelpMessage from './HelpMessage'
import PlanPricing from './PlanPricing'
import ScheduledPlanDetails from './ScheduledPlanDetails'

function PlanUpgrade({ plan }) {
  const { provider } = useParams()
  const { data: plans } = usePlans(provider)
  const { proPlanMonth } = useProPlans({ plans })

  if (!isFreePlan(plan)) return

  return (
    <>
      <div className="mt-4 flex flex-col border">
        <h2 className="p-4 font-semibold">
          {proPlanMonth?.marketingName} plan
        </h2>
        <hr />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Includes</p>
            <BenefitList
              benefits={proPlanMonth?.benefits}
              iconName="check"
              iconColor="text-ds-pink-quinary"
            />
          </div>
          <div className="flex flex-col gap-4">
            <p className="border-t pt-2 text-xs font-semibold sm:border-0 sm:p-0">
              Pricing
            </p>
            <div className="text-xs">
              <p>
                <span className="text-2xl font-semibold">
                  ${proPlanMonth?.baseUnitPrice}
                </span>
                /per user, per month
              </p>
              <p className="text-ds-gray-senary">
                billed annually, or ${proPlanMonth?.baseUnitPrice} per user
                billing monthly
              </p>
            </div>
            <ActionsBilling />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <HelpMessage plan={proPlanMonth?.value} />
      </div>
    </>
  )
}

PlanUpgrade.propTypes = {
  plan: PropType.string.isRequired,
}

function CurrentPlanCard({ accountDetails }) {
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const seats = plan?.quantity
  const { data: ownerData } = usePlanPageData()
  const uploadsNumber = ownerData?.numberOfUploads
  const collectionMethod = accountDetails?.subscriptionDetail?.collectionMethod

  return (
    <div>
      <div className="flex flex-col border">
        <div className="p-4">
          <h2 className="font-semibold">{plan?.marketingName} plan</h2>
          <span className="text-gray-500">Current Plan</span>
        </div>
        <hr />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Includes</p>
            <BenefitList
              benefits={plan?.benefits}
              iconName="check"
              iconColor="text-ds-pink-quinary"
            />
          </div>
          <div className="flex flex-col border-t pt-2 sm:border-0 sm:p-0">
            <p className="mb-4 text-xs font-semibold">Pricing</p>
            <PlanPricing
              value={plan?.value}
              baseUnitPrice={plan?.baseUnitPrice}
            />
            {seats && (
              <p className="text-xs text-ds-gray-senary">
                plan has {seats} seats
              </p>
            )}
            {isBasicPlan(plan?.value) && (
              <p>{uploadsNumber} of 250 uploads in the last 30 days</p>
            )}
            {accountDetails?.scheduleDetail?.scheduledPhase && (
              <ScheduledPlanDetails
                scheduledPhase={accountDetails?.scheduleDetail?.scheduledPhase}
              />
            )}
          </div>
        </div>
        <div className="p-4">
          <HelpMessage plan={plan?.value} collectionMethod={collectionMethod} />
        </div>
      </div>
      <PlanUpgrade plan={plan?.value} />
    </div>
  )
}

CurrentPlanCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default CurrentPlanCard
