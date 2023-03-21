import PropTypes from 'prop-types'
import { useLayoutEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom'

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
import Card from 'ui/Card'

import SentryUpgradeForm from './SentryUpgradeForm'
import UpgradeDetails from './UpgradeDetails'
import UpgradeForm from './UpgradeForm'
import UpgradeFreePlanBanner from './UpgradeFreePlanBanner'

import { useSetCrumbs } from '../../context'

const FormDetails = ({
  accountDetails,
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
  plans: PropTypes.arrayOf(planPropType),
  proPlanMonth: planPropType,
  proPlanYear: planPropType,
  sentryPlanMonth: planPropType,
  sentryPlanYear: planPropType,
}

// eslint-disable-next-line max-statements
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

  return (
    <>
      {/* TODO: Refactor this layout to be it's own reusable component (also used in CurrentPlanCard and the CancelPlan card) */}
      <div className="mt-6 flex flex-col gap-8 md:w-11/12 md:flex-row lg:w-10/12">
        <Card variant="large">
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />
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
