import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import parasolImg from 'assets/plan/parasol.png'
import sentryCodecov from 'assets/plan/sentry_codecov.svg'
import {
  accountDetailsPropType,
  planPropType,
  useAccountDetails,
  usePlans,
} from 'services/account'
import { useMyContexts } from 'services/user'
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
import Select from 'ui/Select'

import SentryUpgradeForm from './SentryUpgradeForm'
import UpgradeForm from './UpgradeForm'

import BenefitList from '../BenefitList'

function shouldRenderCancelLink(accountDetails, plan) {
  // cant cancel a free plan
  if (isFreePlan(plan?.value) || isEnterprisePlan(plan?.value)) return false

  // plan is already set for cancellation
  if (accountDetails?.subscriptionDetail?.cancelAtPeriodEnd) return false

  return true
}

const mergeOrgs = ({ contexts }) => [
  contexts?.currentUser,
  ...(contexts ? contexts?.myOrganizations : []),
]

const determinePlan = ({ accountDetails }) =>
  accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

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
  if (isEnterprisePlan(plan?.value)) {
    return (
      <div className="items-center pt-4">
        <p>
          This organization is on an enterprise plan, to change or cancel your
          plan please contact <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
        </p>
      </div>
    )
  }

  if (canApplySentryUpgrade({ plans })) {
    return (
      <SentryUpgradeForm
        accountDetails={accountDetails}
        sentryPlanYear={sentryPlanYear}
        sentryPlanMonth={sentryPlanMonth}
        organizationName={organizationName}
      />
    )
  }

  return (
    <UpgradeForm
      accountDetails={accountDetails}
      proPlanYear={proPlanYear}
      proPlanMonth={proPlanMonth}
      organizationName={organizationName}
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
function UpgradePlan() {
  const { provider } = useParams()
  const [organizationName, setOrganizationName] = useState()
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const { data: contexts } = useMyContexts({ provider })
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner: organizationName,
    opts: {
      enabled: !!organizationName,
      suspense: false,
    },
  })

  const organizations = mergeOrgs({ contexts })
  const plan = determinePlan({ accountDetails })

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

  if (isEnterprisePlan(plan?.value)) {
    details = {
      img: (
        <div className="-mt-16">
          <img src={parasolImg} alt="parasol" />
        </div>
      ),
      marketingName: plan?.marketingName,
      baseUnitPrice: 'Custom Pricing',
      benefits: plan?.benefits ?? proPlanYear?.benefits,
    }
  } else if (canApplySentryUpgrade({ plans })) {
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
      </Card>
      <div className="flex flex-col gap-4 md:w-2/3">
        <Card variant="upgradeForm">
          <div>
            <h3 className="pb-2 text-base font-semibold">Organization</h3>
            <div className="xl:w-5/12">
              <Select
                items={organizations}
                renderItem={(item) => item?.username}
                onChange={({ username }) => setOrganizationName(username)}
                placeholder="Select organization"
                ariaName="select organization"
                dataMarketing="select organization"
              />
            </div>
          </div>
          <FormDetails
            accountDetails={accountDetails}
            organizationName={organizationName}
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
  )
}

export default UpgradePlan
