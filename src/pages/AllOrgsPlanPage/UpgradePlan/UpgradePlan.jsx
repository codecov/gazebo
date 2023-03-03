import { useState } from 'react'
import { useParams } from 'react-router-dom'

import parasolImg from 'assets/plan/parasol.png'
import { useAccountDetails, usePlans } from 'services/account'
import { useMyContexts } from 'services/user'
import { isFreePlan, useProPlans } from 'shared/utils/billing'
import A from 'ui/A'
import Card from 'ui/Card'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

import UpgradeForm from './UpgradeForm'

import BenefitList from '../BenefitList'

function shouldRenderCancelLink(accountDetails, plan) {
  // cant cancel a free plan
  if (isFreePlan(plan?.value)) return false

  // plan is already set for cancellation
  if (accountDetails?.subscriptionDetail?.cancelAtPeriodEnd) return false

  return true
}

function UpgradePlan() {
  const { provider } = useParams()
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const [organizationName, setOrganizationName] = useState()

  const { data: contexts } = useMyContexts({ provider })

  const { data: accountDetails } = useAccountDetails({
    provider,
    owner: organizationName,
    opts: {
      enabled: !!organizationName,
      suspense: false,
    },
  })

  const organizations = [
    contexts?.currentUser,
    ...(contexts ? contexts?.myOrganizations : []),
  ]
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

  return (
    <div className="mt-6 flex flex-col gap-8 md:w-11/12 md:flex-row lg:w-10/12">
      <Card variant="large">
        <div className="flex flex-col gap-4">
          <div className="-mt-16">
            <img src={parasolImg} alt="parasol" />
          </div>
          <h3 className="text-2xl text-ds-pink-quinary">
            {proPlanYear?.marketingName}
          </h3>
          <h2 className="text-5xl">${proPlanYear?.baseUnitPrice}*</h2>
          <BenefitList
            iconName="check"
            iconColor="text-ds-pink-quinary"
            benefits={proPlanYear?.benefits}
          />
          <p className="text-ds-gray-quaternary">
            *${proPlanMonth?.baseUnitPrice} per user / month if paid monthly
          </p>
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
          <UpgradeForm
            accountDetails={accountDetails}
            proPlanYear={proPlanYear}
            proPlanMonth={proPlanMonth}
            organizationName={organizationName}
          />
        </Card>
      </div>
    </div>
  )
}

export default UpgradePlan
