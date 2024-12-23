import { useParams } from 'react-router-dom'

import { TrialStatuses, useAccountDetails, usePlanData } from 'services/account'
import { isTrialPlan } from 'shared/utils/billing'
import A from 'ui/A/A'

import ChangePlanLink from './ChangePlanLink'

function Activation() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })

  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const activatedUserCount = accountDetails?.activatedUserCount || 0
  const planQuantity = planData?.plan?.planUserCount || 0

  if (
    isTrialPlan(planData?.plan?.value) &&
    planData?.plan?.trialStatus === TrialStatuses.ONGOING
  ) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-base font-semibold">Member activation</h3>
        <section>
          <p>
            <span className="text-lg font-semibold">{activatedUserCount}</span>{' '}
            activated members
          </p>
          <p className="text-xs">
            Your org is on a free trial.{' '}
            <span className="font-semibold">
              <A to={{ pageName: 'upgradeOrgPlan' }}>Upgrade to Pro today.</A>
            </span>
          </p>
        </section>
      </div>
    )
  }

  if (
    planData?.plan?.isFreePlan &&
    planData?.plan?.trialStatus === TrialStatuses.EXPIRED
  ) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-base font-semibold">Member activation</h3>
        <section>
          <p>
            <span className="text-lg font-semibold">{activatedUserCount}</span>{' '}
            activated members of{' '}
            <span className="text-lg font-semibold">{planQuantity}</span>{' '}
            available seats{' '}
          </p>
          <p className="text-xs">
            Your org trialed Pro plan{' '}
            <span className="font-semibold">
              <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade</A>
            </span>
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-base font-semibold">Member activation</h3>
      <p>
        <span className="text-lg font-semibold">{activatedUserCount}</span>{' '}
        activated members of{' '}
        <span className="text-lg font-semibold">{planQuantity}</span> available
        seats{' '}
        {accountDetails && (
          <ChangePlanLink
            accountDetails={accountDetails}
            plan={planData?.plan}
          />
        )}
      </p>
      {/* TODO: new feature https://www.figma.com/file/iNTJAiBYGem3A4LmI4gvKX/Plan-and-members?node-id=103%3A1696 */}
    </div>
  )
}

export default Activation
