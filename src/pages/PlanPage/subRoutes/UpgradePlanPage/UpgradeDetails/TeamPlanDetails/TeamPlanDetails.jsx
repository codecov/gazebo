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
  const { teamPlanYear, teamPlanMonth } = findTeamPlans({ plans })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase

  const cancelAtPeriodEnd =
    accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
  const trialStatus = planData?.plan?.trialStatus

  return (
    <div className="h-fit border md:w-[280px]">
      <h3 className="p-4 font-semibold">{teamPlanYear?.marketingName} plan</h3>
      <hr />
      <div className="flex flex-col gap-6 p-4">
        <div>
          <p className="mb-2 text-xs font-semibold">Pricing</p>
          <p className="text-xs font-semibold">
            <span className="text-2xl">${teamPlanYear?.baseUnitPrice}</span> per
            user/month
          </p>
          <p className="text-xs text-ds-gray-senary">
            billed annually, or ${teamPlanMonth?.baseUnitPrice} for monthly
            billing
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold">Includes</p>
          <BenefitList
            iconName="check"
            iconColor="text-ds-pink-default"
            benefits={teamPlanYear?.benefits}
          />
        </div>
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
