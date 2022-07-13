import { accountDetailsPropType } from 'services/account'
import { isEnterprisePlan, isFreePlan } from 'shared/utils/billing'
import A from 'ui/A'

import ActionsBilling from '../ActionsBilling'

function PlanControls({ accountDetails }) {
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

  if (isEnterprisePlan(plan?.value)) {
    return (
      <div className="items-center mt-1 text-ds-gray-quinary">
        To change or cancel your plan please contact{' '}
        <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </div>
    )
  }

  return (
    <ActionsBilling
      accountDetails={accountDetails}
      isFreePlan={isFreePlan(plan?.value)}
    />
  )
}

PlanControls.propTypes = {
  accountDetails: accountDetailsPropType,
}

export default PlanControls
