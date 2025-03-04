import { z } from 'zod'

import config from 'config'

import { AccountDetailsSchema } from 'services/account/useAccountDetails'
import { Plan } from 'services/account/usePlanData'
import { CollectionMethods } from 'shared/utils/billing'
import A from 'ui/A'

interface ChangePlanLinkProps {
  accountDetails: z.infer<typeof AccountDetailsSchema>
  plan: Plan
}

function ChangePlanLink({ accountDetails, plan }: ChangePlanLinkProps) {
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
      CollectionMethods.INVOICED_CUSTOMER_METHOD || accountDetails?.usesInvoice

  if (config.IS_SELF_HOSTED || isInvoicedCustomer || plan?.isEnterprisePlan) {
    return null
  }

  return (
    <span className="text-xs">
      <A
        to={{ pageName: 'upgradeOrgPlan' }}
        hook="change-plan-link"
        isExternal={false}
        variant="semibold"
      >
        change plan
      </A>
    </span>
  )
}

export default ChangePlanLink
