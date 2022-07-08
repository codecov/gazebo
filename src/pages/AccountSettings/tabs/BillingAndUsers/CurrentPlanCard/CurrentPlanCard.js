import { accountDetailsPropType } from 'services/account'
import A from 'ui/A'
import Card from 'ui/Card'

import PlanControls from './PlanControls'
import PlanPricing from './PlanPricing'
import ScheduledPlanDetails from './ScheduledPlanDetails'
import Usage from './Usage'

import BenefitList from '../../../shared/BenefitList'

function CurrentPlanCard({ accountDetails }) {
  const plan = accountDetails.rootOrganization?.plan ?? accountDetails.plan
  const isBasicPlan = plan.value === 'users-basic'

  return (
    // Wdyt about this? Gives the flexibility to put the color you want, but makes the UI component umpredictable. Alternative is to create a headerVariant class and add a 'secondary' variant there
    <Card
      header={<h3 className="text-ds-pink-quinary">{plan.marketingName}</h3>}
    >
      <div className="flex flex-col gap-6">
        <PlanPricing value={plan?.value} baseUnitPrice={plan?.baseUnitPrice} />
        <BenefitList
          iconName="check"
          iconColor="text-ds-pink-quinary"
          benefits={plan.benefits}
        />
        {/* TODO: Left a note in the Card component to implement a variant that creates <hr />'s after any component */}
        <hr />
        <Usage accountDetails={accountDetails} isBasicPlan={isBasicPlan} />
        <hr />
        {accountDetails?.scheduleDetail?.scheduledPhase && (
          <ScheduledPlanDetails
            scheduledPhase={accountDetails?.scheduleDetail?.scheduledPhase}
          />
        )}
        <PlanControls accountDetails={accountDetails} />
        <hr />
        <div className="text-ds-gray-quinary">
          <span className="font-semibold">Need help?</span> Connect with our
          sales team today at <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
        </div>
      </div>
    </Card>
  )
}

CurrentPlanCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default CurrentPlanCard
