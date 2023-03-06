import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import parasolImg from 'assets/plan/parasol.png'
import {
  accountDetailsPropType,
  planPropType,
  useAccountDetails,
  usePlans,
} from 'services/account'
import { useMyContexts } from 'services/user'
import { isEnterprisePlan, isFreePlan, useProPlans } from 'shared/utils/billing'
import A from 'ui/A'
import Card from 'ui/Card'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

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
  proPlanMonth,
  proPlanYear,
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
  proPlanMonth: planPropType,
  proPlanYear: planPropType,
}

function UpgradePlan() {
  const { provider } = useParams()
  const [organizationName, setOrganizationName] = useState()
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
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

  const details = isEnterprisePlan(plan?.value)
    ? {
        marketingName: plan?.marketingName,
        baseUnitPrice: 'Custom Pricing',
      }
    : {
        marketingName: proPlanYear?.marketingName,
        baseUnitPrice: `$${proPlanYear?.baseUnitPrice}*`,
        priceDisclaimer: (
          <p className="text-ds-gray-quaternary">
            *${proPlanMonth?.baseUnitPrice} per user / month if paid monthly
          </p>
        ),
      }

  return (
    <div className="mt-6 flex flex-col gap-8 md:w-11/12 md:flex-row lg:w-10/12">
      <Card variant="large">
        <div className="flex flex-col gap-4">
          <div className="-mt-16">
            <img src={parasolImg} alt="parasol" />
          </div>
          <h3 className="text-2xl text-ds-pink-quinary">
            {details?.marketingName}
          </h3>
          <h2 className="text-4xl">{details?.baseUnitPrice}</h2>
          <BenefitList
            iconName="check"
            iconColor="text-ds-pink-quinary"
            benefits={plan?.benefits ?? proPlanYear?.benefits}
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
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
          />
        </Card>
      </div>
    </div>
  )
}

export default UpgradePlan
