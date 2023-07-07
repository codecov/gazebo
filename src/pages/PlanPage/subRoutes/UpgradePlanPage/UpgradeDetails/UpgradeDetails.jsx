import PropTypes from 'prop-types'

import sentryCodecov from 'assets/plan/sentry_codecov.svg'
import { accountDetailsPropType, planPropType } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import { canApplySentryUpgrade } from 'shared/utils/billing'
import { SENTRY_PRICE, shouldRenderCancelLink } from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Icon from 'ui/Icon'

function SentryPlanDetails({
  plan,
  sentryPlanMonth,
  sentryPlanYear,
  cancelAtPeriodEnd,
}) {
  return (
    <div className="flex flex-col gap-4 border p-4">
      <img src={sentryCodecov} alt="sentry codecov logos" width="110px" />
      <h3 className="text-2xl font-semibold text-ds-pink-quinary">
        {sentryPlanYear?.marketingName}
      </h3>
      <h2 className="text-4xl">
        ${SENTRY_PRICE}
        <span className="text-base">/monthly</span>
      </h2>
      <BenefitList
        iconName="check"
        iconColor="text-ds-pink-quinary"
        benefits={sentryPlanYear?.benefits}
      />
      <p className="text-ds-gray-quaternary">
        ${sentryPlanMonth?.baseUnitPrice} per user / month if paid monthly
      </p>
      {shouldRenderCancelLink(cancelAtPeriodEnd, plan) && (
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
  )
}

SentryPlanDetails.propTypes = {
  cancelAtPeriodEnd: PropTypes.bool,
  plan: PropTypes.shape({
    value: PropTypes.string,
  }),
  sentryPlanMonth: planPropType,
  sentryPlanYear: planPropType,
}

function UpgradeDetails({
  plan,
  plans,
  proPlanMonth,
  proPlanYear,
  sentryPlanMonth,
  sentryPlanYear,
  accountDetails,
  scheduledPhase,
}) {
  const cancelAtPeriodEnd =
    accountDetails?.subscriptionDetail?.cancelAtPeriodEnd

  if (canApplySentryUpgrade({ plan, plans })) {
    return (
      <SentryPlanDetails
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        plan={plan}
        sentryPlanMonth={sentryPlanMonth}
        sentryPlanYear={sentryPlanYear}
      />
    )
  }

  return (
    <div className="h-fit border">
      <h3 className="p-4 font-semibold">{proPlanYear?.marketingName} plan</h3>
      <hr />
      <div className="flex flex-col gap-4 p-4">
        <BenefitList
          iconName="check"
          iconColor="text-ds-pink-quinary"
          benefits={proPlanYear?.benefits}
        />
        <div>
          <p className="text-xs font-semibold">
            <span className="text-2xl">${proPlanYear?.baseUnitPrice}</span>
            /per user, per month
          </p>
          <p className="text-xs text-ds-gray-quaternary">
            billed annually or ${proPlanMonth?.baseUnitPrice} for monthly
            billing
          </p>
        </div>
        {scheduledPhase && (
          <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
        )}
        {shouldRenderCancelLink(cancelAtPeriodEnd, plan) && (
          <A
            to={{ pageName: 'cancelOrgPlan' }}
            variant="graySenary"
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

UpgradeDetails.propTypes = {
  accountDetails: accountDetailsPropType,
  plan: PropTypes.shape({
    value: PropTypes.string,
  }),
  plans: PropTypes.arrayOf(planPropType),
  proPlanMonth: planPropType,
  proPlanYear: planPropType,
  sentryPlanMonth: planPropType,
  sentryPlanYear: planPropType,
  scheduledPhase: PropTypes.shape({
    quantity: PropTypes.number.isRequired,
    plan: PropTypes.string.isRequired,
    startDate: PropTypes.number.isRequired,
  }),
}

export default UpgradeDetails
