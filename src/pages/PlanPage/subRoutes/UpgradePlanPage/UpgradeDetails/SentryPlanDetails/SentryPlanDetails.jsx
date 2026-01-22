import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import BenefitList from 'shared/plan/BenefitList'
import { BillingRate, findSentryPlans } from 'shared/utils/billing'
import { SENTRY_PRICE, shouldRenderCancelLink } from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Icon from 'ui/Icon'

function SentryPlanDetails() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })

  const cancelAtPeriodEnd =
    accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
  const trialStatus = planData?.plan?.trialStatus
  const currentPlanBillingRate = planData?.plan?.billingRate

  // Show error if no sentry plans are available
  if (!sentryPlanMonth && !sentryPlanYear) {
    return (
      <div className="h-fit border md:w-[280px]">
        <h3 className="p-4 font-semibold">Sentry Pro plan</h3>
        <hr />
        <div className="flex flex-col gap-6 p-4">
          <p className="text-ds-gray-octonary">
            Unable to load Sentry plan details. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-fit border md:w-[280px]">
      <h3 className="p-4 font-semibold">
        {(sentryPlanYear || sentryPlanMonth)?.marketingName} plan
      </h3>
      <hr />
      <div className="flex flex-col gap-6 p-4">
        <div>
          <p className="mb-2 text-xs font-semibold">Pricing</p>
          {currentPlanBillingRate === BillingRate.ANNUALLY && sentryPlanYear ? (
            <>
              <p className="text-xs font-semibold">
                <span className="text-2xl">${SENTRY_PRICE}</span>/month
              </p>
              <p className="text-xs text-ds-gray-senary">
                over 5 users is ${sentryPlanYear?.baseUnitPrice} per user/month,
                billed annually
              </p>
            </>
          ) : sentryPlanMonth ? (
            <>
              <p className="text-xs font-semibold">
                <span className="text-2xl">${SENTRY_PRICE}</span>/month
              </p>
              <p className="text-xs text-ds-gray-senary">
                over 5 users is ${sentryPlanMonth?.baseUnitPrice} per
                user/month, billed monthly
              </p>
            </>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold">Includes</p>
          <BenefitList
            iconName="check"
            iconColor="text-ds-pink-default"
            benefits={(sentryPlanYear || sentryPlanMonth)?.benefits}
          />
        </div>
        {/* TODO_UPGRADE_FORM: Note that there never was schedules shown here like it is in the pro plan details page. This
        is a bug imo and needs to be here in a future ticket */}
        {shouldRenderCancelLink({
          cancelAtPeriodEnd,
          plan: planData?.plan,
          trialStatus,
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
export default SentryPlanDetails
