import Card from 'old_ui/Card'
import { accountDetailsPropType } from 'services/account'
import { isFreePlan } from 'shared/utils/billing'

import ActionsBilling from './ActionsBilling'
import BenefitList from '../../../shared/BenefitList'

function CurrentPlanCard({ accountDetails }) {
  const plan = accountDetails.rootOrganization?.plan ?? accountDetails.plan

  return (
    <Card className="px-12 py-10 pb-4 mb-4">
      <h3 className="text-lg text-pink-500 font-bold">{plan.marketingName}</h3>
      <h2 className="text-4xl uppercase">
        {isFreePlan(plan.value) ? 'Free' : `$${plan.baseUnitPrice}`}
      </h2>
      <div className="mt-8 text-sm border-gray-200">
        <BenefitList
          iconName="check"
          iconColor="text-pink-500"
          benefits={plan.benefits}
        />
      </div>
      <hr className="my-6" />
      <p className="mt-4">
        {accountDetails.activatedUserCount ?? 0} /{' '}
        {accountDetails.plan.quantity ?? 0} Active users
      </p>

      <div className="flex flex-col items-center mt-6">
        <ActionsBilling
          accountDetails={accountDetails}
          isFreePlan={isFreePlan(plan.value)}
        />
      </div>
    </Card>
  )
}

CurrentPlanCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default CurrentPlanCard
