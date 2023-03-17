import PropTypes from 'prop-types'
import { useLayoutEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import parasolImg from 'assets/plan/parasol.png'
import sentryCodecov from 'assets/plan/sentry_codecov.svg'
import {
  accountDetailsPropType,
  planPropType,
  useAccountDetails,
  usePlans,
} from 'services/account'
import {
  canApplySentryUpgrade,
  findSentryPlans,
  isEnterprisePlan,
  isFreePlan,
  useProPlans,
} from 'shared/utils/billing'
import A from 'ui/A'
import Card from 'ui/Card'
import Icon from 'ui/Icon'

import SentryUpgradeForm from './SentryUpgradeForm'
import UpgradeForm from './UpgradeForm'
import UpgradeFreePlanBanner from './UpgradeFreePlanBanner'

import { useSetCrumbs } from '../../context'
import BenefitList from '../../shared/BenefitList'

function shouldRenderCancelLink(accountDetails, plan) {
  // cant cancel a free plan
  if (isFreePlan(plan?.value)) return false

  // plan is already set for cancellation
  if (accountDetails?.subscriptionDetail?.cancelAtPeriodEnd) return false

  return true
}

const FormDetails = ({
  accountDetails,
  organizationName,
  plan,
  plans,
  proPlanMonth,
  proPlanYear,
  sentryPlanMonth,
  sentryPlanYear,
}) => {
  if (canApplySentryUpgrade({ plans })) {
    return (
      <SentryUpgradeForm
        accountDetails={accountDetails}
        sentryPlanYear={sentryPlanYear}
        sentryPlanMonth={sentryPlanMonth}
      />
    )
  }

  return (
    <UpgradeForm
      accountDetails={accountDetails}
      proPlanYear={proPlanYear}
      proPlanMonth={proPlanMonth}
    />
  )
}

FormDetails.propTypes = {
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

// eslint-disable-next-line max-statements, complexity
function UpgradePlanPage() {
  const { provider, owner } = useParams()
  const setCrumbs = useSetCrumbs()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: 'upgradeOrgPlan',
        text: 'Manage Plan',
      },
    ])
  }, [setCrumbs])

  // redirect right away if the user is on an enterprise plan
  if (isEnterprisePlan(plan?.value)) {
    return <Redirect to={`/plan/${provider}/${owner}`} />
  }

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
    benefits: plan?.benefits ?? proPlanYear?.benefits,
  }

  if (canApplySentryUpgrade({ plans })) {
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
      benefits: plan?.benefits ?? sentryPlanYear?.benefits,
    }
  }

  return (
    <>
      {/* TODO: Refactor this layout to be it's own reusable component (also used in CurrentPlanCard and the CancelPlan card) */}
      <div className="mt-6 flex flex-col gap-8 md:w-11/12 md:flex-row lg:w-10/12">
        <Card variant="large">
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
            {shouldRenderCancelLink(accountDetails, plan) && (
              <A
                to={{ pageName: 'cancelOrgPlan' }}
                variant="black"
                hook="cancel-plan"
              >
                Cancel plan
                <Icon name="chevronRight" size="sm" variant="solid" />
              </A>
            )}
          </div>
        </Card>
        <div className="flex flex-col gap-4 md:w-2/3">
          {isFreePlan(plan?.value) && <UpgradeFreePlanBanner owner={owner} />}
          <Card variant="upgradeForm">
            <FormDetails
              accountDetails={accountDetails}
              plan={plan}
              plans={plans}
              proPlanMonth={proPlanMonth}
              proPlanYear={proPlanYear}
              sentryPlanYear={sentryPlanYear}
              sentryPlanMonth={sentryPlanMonth}
            />
          </Card>
        </div>
      </div>
    </>
  )
}

export default UpgradePlanPage
