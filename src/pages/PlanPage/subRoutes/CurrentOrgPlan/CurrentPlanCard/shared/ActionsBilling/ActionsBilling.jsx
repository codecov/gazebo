import { useParams } from 'react-router-dom'

import githubLogo from 'assets/githublogo.png'
import { planPropType, useAccountDetails, usePlans } from 'services/account'
import {
  canApplySentryUpgrade,
  isFreePlan,
  isSentryPlan,
} from 'shared/utils/billing'
import Button from 'ui/Button'

function PlansActionsBilling({ plan }) {
  const { provider } = useParams()
  const { data: plans } = usePlans(provider)

  if (canApplySentryUpgrade({ plan, plans })) {
    return (
      <div className="flex self-start">
        <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
          {isSentryPlan(plan?.value)
            ? 'Manage plan'
            : 'Upgrade to Sentry Pro Team plan'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex self-start">
      <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
        {isFreePlan(plan?.value) ? 'Upgrade to Pro Team plan' : 'Manage plan'}
      </Button>
    </div>
  )
}

PlansActionsBilling.propTypes = {
  plan: planPropType,
}

function ActionsBilling() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const username = accountDetails?.rootOrganization?.username

  if (accountDetails?.planProvider === 'github') {
    return (
      <div className="flex flex-col gap-4 border-ds-gray-secondary">
        <hr />
        <div className="flex gap-4">
          <img className="h-8 w-8" alt="Github" src={githubLogo} />
          <p className="text-sm">
            Your account is configured via GitHub Marketplace
          </p>
        </div>
        <div className="flex self-start">
          <Button to={{ pageName: 'githubMarketplace' }} variant="primary">
            Manage billing in GitHub
          </Button>
        </div>
      </div>
    )
  }

  if (username) {
    return (
      <div className="flex flex-col gap-4">
        <hr />
        <p className="text-sm">
          This subgroup’s billing is managed by {username}.
        </p>
        <div className="flex self-start">
          <Button
            to={{
              pageName: 'billingAndUsers',
              options: { owner: username },
            }}
            variant="primary"
          >
            View Billing
          </Button>
        </div>
      </div>
    )
  }

  return <PlansActionsBilling plan={plan} />
}

export default ActionsBilling
