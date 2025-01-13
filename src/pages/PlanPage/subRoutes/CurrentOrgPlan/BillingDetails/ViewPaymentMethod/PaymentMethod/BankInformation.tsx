import { z } from 'zod'

import bankLogo from 'assets/billing/bank.svg'
import { SubscriptionDetailSchema } from 'services/account'

interface BankInformationProps {
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
}
function BankInformation({ subscriptionDetail }: BankInformationProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <img src={bankLogo} alt="bank logo" />
        <div className="ml-1 flex flex-col self-center">
          <b>
            {subscriptionDetail?.defaultPaymentMethod?.usBankAccount?.bankName}
            &nbsp;••••&nbsp;
            {subscriptionDetail?.defaultPaymentMethod?.usBankAccount?.last4}
          </b>
        </div>
      </div>
    </div>
  )
}

export default BankInformation
