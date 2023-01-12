import { accountDetailsPropType } from 'services/account'
import { isEnterprisePlan, isFreePlan } from 'shared/utils/billing'
import A from 'ui/A'

import ActionsBilling from '../ActionsBilling'

const INVOICED_CUSTOMER = 'send_invoice'
function PlanControls({ accountDetails }) {
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod === INVOICED_CUSTOMER

  if (isEnterprisePlan(plan?.value) || isInvoicedCustomer) {
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
