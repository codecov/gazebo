import { accountDetailsPropType } from 'services/account'
import { isEnterprisePlan, isFreePlan } from 'shared/utils/billing'
import A from 'ui/A'

import ActionsBilling from '../ActionsBilling'

const CollectionMethods = Object.freeze({
  INVOICED_CUSTOMER_METHOD: 'send_invoice',
  AUTOMATICALLY_CHARGED_METHOD: 'charge_automatically',
})

function PlanControls({ accountDetails }) {
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD

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
