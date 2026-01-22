import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import { BillingRate, findProPlans } from 'shared/utils/billing'
import { shouldRenderCancelLink } from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Icon from 'ui/Icon'

function ProPlanDetails() {
  const { provider, owner } = useParams()
  const { data: planData } = usePlanData({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { proPlanMonth, proPlanYear } = findProPlans({ plans })

  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase

  const cancelAtPeriodEnd =
    accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
  const trialStatus = planData?.plan?.trialStatus
  const currentPlanBillingRate = planData?.plan?.billingRate

  // Show error if no pro plans are available
  if (!proPlanMonth && !proPlanYear) {
    return (
      <div className="h-fit border md:w-[280px]">
        <h3 className="p-4 font-semibold">Pro plan</h3>
        <hr />
        <div className="flex flex-col gap-6 p-4">
          <p className="text-ds-gray-octonary">
            Unable to load Pro plan details. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-fit border md:w-[280px]">
      <h3 className="p-4 font-semibold">
        {(proPlanYear || proPlanMonth)?.marketingName} plan
      </h3>
      <hr />
      <div className="flex flex-col gap-6 p-4">
        <div>
          <p className="mb-2 text-xs font-semibold">Pricing</p>
          {currentPlanBillingRate === BillingRate.ANNUALLY && proPlanYear ? (
            <>
              <p className="text-xs font-semibold">
                <span className="text-2xl">${proPlanYear?.baseUnitPrice}</span>{' '}
                per user/month
              </p>
              <p className="text-xs text-ds-gray-senary">
                billed annually
                {proPlanMonth &&
                  `, or $${proPlanMonth?.baseUnitPrice} for monthly billing`}
              </p>
            </>
          ) : proPlanMonth ? (
            <>
              <p className="text-xs font-semibold">
                <span className="text-2xl">${proPlanMonth?.baseUnitPrice}</span>{' '}
                per user/month
              </p>
              <p className="text-xs text-ds-gray-senary">billed monthly</p>
            </>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold">Includes</p>
          <BenefitList
            iconName="check"
            iconColor="text-ds-pink-default"
            benefits={(proPlanYear || proPlanMonth)?.benefits}
          />
        </div>
        {scheduledPhase && (
          <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
        )}
        {shouldRenderCancelLink({
          cancelAtPeriodEnd,
          trialStatus,
          isFreePlan: planData?.plan?.isFreePlan,
          plan: planData?.plan,
        }) && (
          <A
            to={{ pageName: 'cancelOrgPlan' }}
            variant="black"
            hook="cancel-plan"
          >
            Cancel
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        )}
      </div>
    </div>
  )
}

export default ProPlanDetails
