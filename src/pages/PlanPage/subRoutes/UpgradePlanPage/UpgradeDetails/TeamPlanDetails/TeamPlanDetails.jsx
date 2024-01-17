import { useParams } from 'react-router-dom'

import {
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import { findTeamPlans } from 'shared/utils/billing'
import { shouldRenderCancelLink } from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Icon from 'ui/Icon'

function TeamPlanDetails() {
  const { provider, owner } = useParams()
  const { data: planData } = usePlanData({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanYear } = findTeamPlans({ plans })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase

  const cancelAtPeriodEnd =
    accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
  const trialStatus = planData?.plan?.trialStatus

  return (
    <div className="h-fit border">
      <h3 className="pl-4 pt-4 font-semibold">
        {teamPlanYear?.marketingName} plan
      </h3>
      <p className="pl-4 text-xs">
        <span className="text-base">${teamPlanYear?.baseUnitPrice}</span>
        /per user, per month
      </p>
      <div className="flex flex-col gap-4 p-4">
        <BenefitList
          iconName="check"
          iconColor="text-ds-pink-quinary"
          benefits={teamPlanYear?.benefits}
        />
        {scheduledPhase && (
          <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
        )}
        {shouldRenderCancelLink(cancelAtPeriodEnd, plan, trialStatus) && (
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
    </div>
  )
}

export default TeamPlanDetails
