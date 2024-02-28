import PropType from 'prop-types'

import { planPropType } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import { findSentryPlans, useProPlans } from 'shared/utils/billing'
import { SENTRY_PRICE } from 'shared/utils/upgradeForm'

import ActionsBilling from '../../shared/ActionsBilling/ActionsBilling'
import ProPlanSubheading from '../ProPlanSubheading'

function PlanDetails({
  isSentryUpgrade,
  sentryAnnualUnitPrice,
  proMonthlyUnitPrice,
  proYearlyUnitPrice,
}) {
  if (isSentryUpgrade) {
    return (
      <div className="text-xs">
        <p className="font-semibold">
          <span className="text-2xl">${SENTRY_PRICE}</span>
          /month
        </p>
        <p className="text-ds-gray-senary">
          over 5 users is ${sentryAnnualUnitPrice} per user/month, billed
          annually
        </p>
      </div>
    )
  }

  return (
    <div className="text-xs">
      <p className="font-semibold">
        <span className="text-2xl">${proYearlyUnitPrice}</span> per user/month
      </p>
      <p className="text-ds-gray-senary">
        billed annually, or ${proMonthlyUnitPrice} per user billing monthly
      </p>
    </div>
  )
}

PlanDetails.propTypes = {
  isSentryUpgrade: PropType.bool.isRequired,
  sentryAnnualUnitPrice: PropType.number,
  proMonthlyUnitPrice: PropType.number,
  proYearlyUnitPrice: PropType.number,
}

function PlanUpgradePro({ isSentryUpgrade, plans }) {
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })

  const upgradeToPlan = isSentryUpgrade ? sentryPlanYear : proPlanMonth

  return (
    <div className="flex flex-col border">
      <div className="p-4">
        <h2 className="font-semibold">{upgradeToPlan?.marketingName} plan</h2>
        <ProPlanSubheading />
      </div>
      <hr />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Includes</p>
          <BenefitList
            benefits={upgradeToPlan?.benefits}
            iconName="check"
            iconColor="text-ds-pink-quinary"
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="border-t pt-2 text-xs font-semibold sm:border-0 sm:p-0">
            Pricing
          </p>
          <PlanDetails
            isSentryUpgrade={isSentryUpgrade}
            sentryAnnualUnitPrice={sentryPlanYear?.baseUnitPrice}
            proMonthlyUnitPrice={proPlanMonth?.baseUnitPrice}
            proYearlyUnitPrice={proPlanYear?.baseUnitPrice}
          />
          <ActionsBilling />
        </div>
      </div>
    </div>
  )
}

PlanUpgradePro.propTypes = {
  isSentryUpgrade: PropType.bool.isRequired,
  plans: PropType.arrayOf(planPropType).isRequired,
}

export default PlanUpgradePro
