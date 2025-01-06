import { useParams } from 'react-router-dom'

import githubLogo from 'assets/githublogo.png'
import {
  TrialStatuses,
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import { useStartTrial } from 'services/trial'
import { canApplySentryUpgrade } from 'shared/utils/billing'
import A from 'ui/A/A'
import Button from 'ui/Button'

function PlansActionsBilling() {
  const { provider, owner } = useParams()
  const { data: plans } = useAvailablePlans({ provider, owner })

  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const { mutate, isLoading } = useStartTrial()

  const canStartTrial =
    planData?.plan?.trialStatus === TrialStatuses.NOT_STARTED &&
    planData?.plan?.isFreePlan &&
    planData?.hasPrivateRepos

  if (canStartTrial) {
    return (
      <div className="flex items-center gap-4 self-start">
        <Button
          onClick={() => {
            mutate({ owner })
          }}
          hook="start-trial"
          variant="primary"
          isLoading={isLoading}
        >
          Start trial
        </Button>
        <p className="font-semibold">OR</p>
        <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade now</A>
      </div>
    )
  }

  if (
    canApplySentryUpgrade({
      isEnterprisePlan: planData?.plan?.isEnterprisePlan,
      plans,
    })
  ) {
    return (
      <div className="flex self-start">
        <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
          {planData?.plan?.isSentryPlan ? 'Manage plan' : 'Upgrade'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex self-start">
      <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
        {planData?.plan?.isFreePlan || planData?.plan?.isTrialPlan
          ? 'Upgrade'
          : 'Manage plan'}
      </Button>
    </div>
  )
}

function ActionsBilling() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const username = accountDetails?.rootOrganization?.username

  if (accountDetails?.planProvider === 'github') {
    return (
      <div className="flex flex-col gap-4 border-ds-gray-secondary">
        <hr />
        <div className="flex gap-4">
          <img className="size-8" alt="Github" src={githubLogo} />
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
          This subgroup&apos;s billing is managed by {username}.
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

  return <PlansActionsBilling />
}

export default ActionsBilling
