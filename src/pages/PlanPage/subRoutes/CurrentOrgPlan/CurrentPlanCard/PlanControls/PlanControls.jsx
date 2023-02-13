import { accountDetailsPropType } from 'services/account'
import {
  CollectionMethods,
  isEnterprisePlan,
  isFreePlan,
} from 'shared/utils/billing'
import A from 'ui/A'

import ActionsBilling from '../ActionsBilling'

function PlanControls({ accountDetails }) {
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD

  if (isEnterprisePlan(plan?.value) || isInvoicedCustomer) {
    return (
      <div className="mt-1 items-center text-ds-gray-quinary">
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
