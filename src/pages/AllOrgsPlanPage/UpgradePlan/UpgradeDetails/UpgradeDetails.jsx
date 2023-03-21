import PropTypes from 'prop-types'

import parasolImg from 'assets/plan/parasol.png'
import sentryCodecov from 'assets/plan/sentry_codecov.svg'
import BenefitList from 'pages/AllOrgsPlanPage/BenefitList'
import { accountDetailsPropType, planPropType } from 'services/account'
import {
  canApplySentryUpgrade,
  isEnterprisePlan,
  isFreePlan,
} from 'shared/utils/billing'
import A from 'ui/A'
import Icon from 'ui/Icon'

function shouldRenderCancelLink(accountDetails, plan) {
  // cant cancel a free plan
  if (isFreePlan(plan?.value) || isEnterprisePlan(plan?.value)) return false

  // plan is already set for cancellation
  if (accountDetails?.subscriptionDetail?.cancelAtPeriodEnd) return false

  return true
}

// eslint-disable-next-line complexity
const determineDetails = ({
  plan,
  plans,
  proPlanMonth,
  proPlanYear,
  sentryPlanMonth,
  sentryPlanYear,
}) => {
  let details = {
    img: (
      <div className="-mt-16">
        <img src={parasolImg} alt="parasol" />
      </div>
    ),
    marketingName: proPlanYear?.marketingName,
    baseUnitPrice: (
      <>
        ${proPlanYear?.baseUnitPrice}*
        <span className="text-base">/monthly</span>
      </>
    ),
    priceDisclaimer: (
      <p className="text-ds-gray-quaternary">
        *${proPlanMonth?.baseUnitPrice} per user / month if paid monthly
      </p>
    ),
    benefits: proPlanYear?.benefits,
  }

  if (isEnterprisePlan(plan?.value)) {
    details = {
      img: (
        <div className="-mt-16">
          <img src={parasolImg} alt="parasol" />
        </div>
      ),
      marketingName: plan?.marketingName,
      baseUnitPrice: 'Custom Pricing',
      benefits: proPlanYear?.benefits,
    }
  } else if (canApplySentryUpgrade({ plan, plans })) {
    details = {
      img: (
        <div>
          <img src={sentryCodecov} alt="sentry codecov logos" />
        </div>
      ),
      marketingName: sentryPlanYear?.marketingName,
      baseUnitPrice: (
        <>
          $29.99<span className="text-base">/monthly</span>
        </>
      ),
      priceDisclaimer: (
        <p className="text-ds-gray-quaternary">
          *${sentryPlanMonth?.baseUnitPrice} per user / month if paid monthly
        </p>
      ),
      benefits: sentryPlanYear?.benefits,
    }
  }

  return details
}

function UpgradeDetails({
  accountDetails,
  organizationName,
  plan,
  plans,
  proPlanMonth,
  proPlanYear,
  sentryPlanMonth,
  sentryPlanYear,
}) {
  const details = determineDetails({
    plan,
    plans,
    proPlanMonth,
    proPlanYear,
    sentryPlanMonth,
    sentryPlanYear,
  })

  return (
    <div className="flex flex-col gap-4">
      {details?.img}
      <h3 className="text-2xl font-semibold text-ds-pink-quinary">
        {details?.marketingName}
      </h3>
      <h2 className="text-4xl">{details?.baseUnitPrice}</h2>
      <BenefitList
        iconName="check"
        iconColor="text-ds-pink-quinary"
        benefits={details?.benefits}
      />
      {details?.priceDisclaimer}
      {organizationName && shouldRenderCancelLink(accountDetails, plan) && (
        <A
          to={{
            pageName: 'cancelOrgPlan',
            options: { owner: organizationName },
          }}
          variant="grayQuinary"
          hook="cancel-plan"
        >
          Cancel plan <Icon name="chevronRight" size="sm" variant="solid" />
        </A>
      )}
    </div>
  )
}

UpgradeDetails.propTypes = {
  accountDetails: accountDetailsPropType,
  organizationName: PropTypes.string,
  plan: PropTypes.shape({
    value: PropTypes.string,
  }),
  plans: PropTypes.arrayOf(planPropType),
  proPlanMonth: planPropType,
  proPlanYear: planPropType,
  sentryPlanMonth: planPropType,
  sentryPlanYear: planPropType,
}

export default UpgradeDetails
