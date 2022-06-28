import Card from 'old_ui/Card'
import { accountDetailsPropType } from 'services/account'
import A from 'ui/A'

import PlanControls from './PlanControls'
import PlanPricing from './PlanPricing'
import ScheduledPlanDetails from './ScheduledPlanDetails'
import Usage from './Usage'

import BenefitList from '../../../shared/BenefitList'

function CurrentPlanCard({ accountDetails }) {
  const plan = accountDetails.rootOrganization?.plan ?? accountDetails.plan
  const isBasicPlan = plan.value === 'users-basic'

  return (
    <Card className="px-12 py-10 pb-4 mb-4">
      <h3 className="text-lg text-pink-500 font-bold">{plan.marketingName}</h3>
      <PlanPricing value={plan?.value} baseUnitPrice={plan?.baseUnitPrice} />
      <div className="mt-8 text-sm border-gray-200">
        <BenefitList
          iconName="check"
          iconColor="text-pink-500"
          benefits={plan.benefits}
        />
      </div>
      <hr className="my-6" />
      <Usage accountDetails={accountDetails} isBasicPlan={isBasicPlan} />
      {accountDetails?.scheduleDetail?.scheduledPhase && (
        <ScheduledPlanDetails
          scheduledPhase={accountDetails?.scheduleDetail?.scheduledPhase}
        />
      )}
      <PlanControls accountDetails={accountDetails} />
      <hr className="my-6" />
      <div className="mt-6 text-ds-gray-quinary">
        <span className="font-semibold">Need help?</span> Connect with our sales
        team today at <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </div>
    </Card>
  )
}

CurrentPlanCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default CurrentPlanCard
